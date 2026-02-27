const STORAGE_KEY = 'chequeRecords';

const form = document.getElementById('cheque-form');
const editIdInput = document.getElementById('edit-id');
const numberInput = document.getElementById('cheque-number');
const accountInput = document.getElementById('account-name');
const bankInput = document.getElementById('bank-name');
const amountInput = document.getElementById('amount');
const issueDateInput = document.getElementById('issue-date');
const statusInput = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const searchInput = document.getElementById('search');
const recordsBody = document.getElementById('records-body');
const rowTemplate = document.getElementById('row-template');

const loadRecords = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const saveRecords = (records) => localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

const formatAmount = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const clearForm = () => {
  form.reset();
  editIdInput.value = '';
};

const getFormData = () => ({
  id: editIdInput.value || crypto.randomUUID(),
  number: numberInput.value.trim(),
  account: accountInput.value.trim(),
  bank: bankInput.value.trim(),
  amount: Number(amountInput.value),
  issueDate: issueDateInput.value,
  status: statusInput.value,
});

const matchesSearch = (record, text) => {
  if (!text) return true;
  const value = text.toLowerCase();
  return [record.number, record.account, record.bank, record.status]
    .some((field) => field.toLowerCase().includes(value));
};

const render = () => {
  const records = loadRecords();
  const search = searchInput.value.trim();

  recordsBody.innerHTML = '';
  records
    .filter((record) => matchesSearch(record, search))
    .forEach((record) => {
      const row = rowTemplate.content.cloneNode(true);
      row.querySelector('[data-field="number"]').textContent = record.number;
      row.querySelector('[data-field="account"]').textContent = record.account;
      row.querySelector('[data-field="bank"]').textContent = record.bank;
      row.querySelector('[data-field="amount"]').textContent = formatAmount(record.amount);
      row.querySelector('[data-field="issueDate"]').textContent = record.issueDate;
      row.querySelector('[data-field="status"]').textContent = record.status;

      row.querySelector('[data-action="edit"]').addEventListener('click', () => {
        editIdInput.value = record.id;
        numberInput.value = record.number;
        accountInput.value = record.account;
        bankInput.value = record.bank;
        amountInput.value = record.amount;
        issueDateInput.value = record.issueDate;
        statusInput.value = record.status;
      });

      row.querySelector('[data-action="delete"]').addEventListener('click', () => {
        const updated = loadRecords().filter((item) => item.id !== record.id);
        saveRecords(updated);
        render();
      });

      recordsBody.appendChild(row);
    });
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const record = getFormData();
  const records = loadRecords();
  const index = records.findIndex((item) => item.id === record.id);

  if (index === -1) {
    records.push(record);
  } else {
    records[index] = record;
  }

  saveRecords(records);
  clearForm();
  render();
});

resetBtn.addEventListener('click', clearForm);
searchInput.addEventListener('input', render);

render();
