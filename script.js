const form = document.getElementById('chequeForm');
const tableBody = document.getElementById('chequeTable');
const searchInput = document.getElementById('search');
const summaryBox = document.getElementById('summary');
const STORAGE_KEY = 'chequeMaintainRecords';

let records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const saveRecords = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

const renderSummary = (items) => {
  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
  const pending = items.filter((item) => item.status === 'Pending').length;
  const cleared = items.filter((item) => item.status === 'Cleared').length;
  const bounced = items.filter((item) => item.status === 'Bounced').length;

  summaryBox.innerHTML = `
    <span>Total Records: <strong>${items.length}</strong></span>
    <span>Total Amount: <strong>${formatCurrency(total)}</strong></span>
    <span>Pending: <strong>${pending}</strong></span>
    <span>Cleared: <strong>${cleared}</strong></span>
    <span>Bounced: <strong>${bounced}</strong></span>
  `;
};

const renderTable = (items) => {
  if (!items.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;color:#64748b;">No cheque records found.</td>
      </tr>
    `;
    renderSummary([]);
    return;
  }

  tableBody.innerHTML = items
    .map(
      (item) => `
      <tr>
        <td>${item.holder}</td>
        <td>${item.chequeNumber}</td>
        <td>${item.bankName}</td>
        <td>${formatCurrency(Number(item.amount))}</td>
        <td>${item.issueDate}</td>
        <td class="status ${item.status}">${item.status}</td>
        <td><button class="delete" data-id="${item.id}">Delete</button></td>
      </tr>
    `
    )
    .join('');

  renderSummary(items);
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const newRecord = {
    id: Date.now().toString(),
    holder: document.getElementById('holder').value.trim(),
    chequeNumber: document.getElementById('chequeNumber').value.trim(),
    bankName: document.getElementById('bankName').value.trim(),
    amount: document.getElementById('amount').value,
    issueDate: document.getElementById('issueDate').value,
    status: document.getElementById('status').value
  };

  records.unshift(newRecord);
  saveRecords();
  form.reset();
  renderTable(records);
});

tableBody.addEventListener('click', (event) => {
  if (!event.target.classList.contains('delete')) {
    return;
  }

  const id = event.target.dataset.id;
  records = records.filter((item) => item.id !== id);
  saveRecords();

  const keyword = searchInput.value.trim().toLowerCase();
  const filtered = records.filter((item) => {
    const content = `${item.holder} ${item.chequeNumber} ${item.bankName} ${item.status}`.toLowerCase();
    return content.includes(keyword);
  });

  renderTable(filtered);
});

searchInput.addEventListener('input', () => {
  const keyword = searchInput.value.trim().toLowerCase();
  const filtered = records.filter((item) => {
    const content = `${item.holder} ${item.chequeNumber} ${item.bankName} ${item.status}`.toLowerCase();
    return content.includes(keyword);
  });

  renderTable(filtered);
});

renderTable(records);
