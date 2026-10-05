/**
 * PAIDOFF — Business Debt & Wholesaler Payoff Tracker
 * Client-side offline-first architecture with LocalStorage persistence.
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    PARTNERS: 'paidoff_partners_v1',
    TRANSACTIONS: 'paidoff_transactions_v1',
    THEME: 'paidoff_theme'
  };

  // State
  let partners = [];
  let transactions = [];

  // Sample Demo Data (Loaded on demand or first run if empty)
  const SAMPLE_DATA = {
    partners: [
      {
        id: 'p-1',
        name: 'Apex Wholesale Dist.',
        category: 'Wholesaler',
        phone: '+1 (555) 234-8901',
        notes: 'Primary beverage & bulk dry goods distributor. Terms: Net-30',
        createdAt: '2026-09-01T10:00:00Z'
      },
      {
        id: 'p-2',
        name: 'Metro Food Supply Co.',
        category: 'Supplier',
        phone: 'orders@metrofood.internal',
        notes: 'Weekly fresh ingredients invoice.',
        createdAt: '2026-09-05T12:00:00Z'
      },
      {
        id: 'p-3',
        name: 'Summit Equipment Leasing',
        category: 'Lender / Investor',
        phone: '+1 (555) 881-2299',
        notes: 'Commercial espresso & refrigeration equipment financing.',
        createdAt: '2026-08-15T09:00:00Z'
      }
    ],
    transactions: [
      {
        id: 't-1',
        partnerId: 'p-1',
        type: 'debt',
        amount: 3450.00,
        date: '2026-09-10',
        category: 'Wholesale Batch',
        reference: 'INV-88910',
        notes: 'Bulk stock delivery for September inventory.',
        createdAt: '2026-09-10T10:30:00Z'
      },
      {
        id: 't-2',
        partnerId: 'p-1',
        type: 'payment',
        amount: 1500.00,
        date: '2026-09-22',
        category: 'Repayment (Bank / Transfer)',
        reference: 'WIRE-33019',
        notes: 'First installment wire transfer via Chase.',
        createdAt: '2026-09-22T14:15:00Z'
      },
      {
        id: 't-3',
        partnerId: 'p-2',
        type: 'debt',
        amount: 1240.50,
        date: '2026-09-18',
        category: 'Inventory Purchase',
        reference: 'MFS-4412',
        notes: 'Weekly fresh produce and pantry staples.',
        createdAt: '2026-09-18T08:00:00Z'
      },
      {
        id: 't-4',
        partnerId: 'p-2',
        type: 'payment',
        amount: 1240.50,
        date: '2026-09-28',
        category: 'Full Payoff',
        reference: 'CHECK-1044',
        notes: 'Fully settled balance before due date.',
        createdAt: '2026-09-28T11:00:00Z'
      },
      {
        id: 't-5',
        partnerId: 'p-3',
        type: 'debt',
        amount: 5000.00,
        date: '2026-08-20',
        category: 'Equipment / Supplies',
        reference: 'LEAS-9921',
        notes: 'Espresso machine purchase contract.',
        createdAt: '2026-08-20T09:30:00Z'
      },
      {
        id: 't-6',
        partnerId: 'p-3',
        type: 'payment',
        amount: 1250.00,
        date: '2026-09-20',
        category: 'Repayment (Bank / Transfer)',
        reference: 'ACH-77218',
        notes: 'Monthly equipment payment.',
        createdAt: '2026-09-20T16:00:00Z'
      }
    ]
  };

  // DOM Elements
  const el = {
    // Theme
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    
    // Top actions & Menus
    dataMenuBtn: document.getElementById('dataMenuBtn'),
    dataMenuDropdown: document.getElementById('dataMenuDropdown'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    importJsonInput: document.getElementById('importJsonInput'),
    loadSampleDataBtn: document.getElementById('loadSampleDataBtn'),
    clearAllDataBtn: document.getElementById('clearAllDataBtn'),
    printStatementBtn: document.getElementById('printStatementBtn'),

    // Modals
    openNewPartnerBtn: document.getElementById('openNewPartnerBtn'),
    partnerModal: document.getElementById('partnerModal'),
    partnerForm: document.getElementById('partnerForm'),
    partnerModalTitle: document.getElementById('partnerModalTitle'),
    partnerEditId: document.getElementById('partnerEditId'),
    partnerName: document.getElementById('partnerName'),
    partnerType: document.getElementById('partnerType'),
    partnerPhone: document.getElementById('partnerPhone'),
    partnerNotes: document.getElementById('partnerNotes'),

    openNewTransactionBtn: document.getElementById('openNewTransactionBtn'),
    transactionModal: document.getElementById('transactionModal'),
    transactionForm: document.getElementById('transactionForm'),
    transactionModalTitle: document.getElementById('transactionModalTitle'),
    transactionEditId: document.getElementById('transactionEditId'),
    txPartner: document.getElementById('txPartner'),
    txDate: document.getElementById('txDate'),
    txAmount: document.getElementById('txAmount'),
    txCategory: document.getElementById('txCategory'),
    txReference: document.getElementById('txReference'),
    txNotes: document.getElementById('txNotes'),

    // Metrics
    metricTotalOwed: document.getElementById('metricTotalOwed'),
    metricTotalPaid: document.getElementById('metricTotalPaid'),
    metricPaybackRate: document.getElementById('metricPaybackRate'),
    metricTotalIncurred: document.getElementById('metricTotalIncurred'),
    metricTransactionCount: document.getElementById('metricTransactionCount'),
    metricPartnersCount: document.getElementById('metricPartnersCount'),
    metricActiveOwedCount: document.getElementById('metricActiveOwedCount'),

    // Calculator Panel
    calcPartnerSelect: document.getElementById('calcPartnerSelect'),
    calcAmountInput: document.getElementById('calcAmountInput'),
    calcFullPayBtn: document.getElementById('calcFullPayBtn'),
    calcCurrentOwed: document.getElementById('calcCurrentOwed'),
    calcNewBalance: document.getElementById('calcNewBalance'),
    calcRecordPaymentBtn: document.getElementById('calcRecordPaymentBtn'),

    // Partners View
    partnerSearchInput: document.getElementById('partnerSearchInput'),
    partnersGrid: document.getElementById('partnersGrid'),

    // Ledger View
    filterPartner: document.getElementById('filterPartner'),
    filterType: document.getElementById('filterType'),
    ledgerSearchInput: document.getElementById('ledgerSearchInput'),
    ledgerTable: document.getElementById('ledgerTable'),
    ledgerTableBody: document.getElementById('ledgerTableBody'),
    ledgerEmptyState: document.getElementById('ledgerEmptyState'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  /* ==========================================================================
     Helper Utilities
     ========================================================================== */
  function formatMoney(amount) {
    const val = Number(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function generateId(prefix = 'id') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  }

  function sanitize(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${sanitize(message)}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /* ==========================================================================
     State & Storage Management
     ========================================================================== */
  function loadState() {
    try {
      const storedPartners = localStorage.getItem(STORAGE_KEYS.PARTNERS);
      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

      if (storedPartners && storedTransactions) {
        partners = JSON.parse(storedPartners);
        transactions = JSON.parse(storedTransactions);
      } else {
        // Initialize with default demo data for an immediate working showcase
        partners = [...SAMPLE_DATA.partners];
        transactions = [...SAMPLE_DATA.transactions];
        saveState();
      }
    } catch (err) {
      console.error('Error loading data from localStorage:', err);
      partners = [...SAMPLE_DATA.partners];
      transactions = [...SAMPLE_DATA.transactions];
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (err) {
      console.error('Error saving state:', err);
      showToast('Failed to save to local storage. Storage might be full.', 'error');
    }
  }

  /* ==========================================================================
     Calculations & Financial Ledger Math
     ========================================================================== */
  function calculatePartnerFinancials(partnerId) {
    const partnerTxs = transactions.filter(t => t.partnerId === partnerId);
    let totalDebt = 0;
    let totalPaid = 0;

    for (const tx of partnerTxs) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'debt') {
        totalDebt += amt;
      } else if (tx.type === 'payment') {
        totalPaid += amt;
      }
    }

    const balance = totalDebt - totalPaid;
    const payoffRate = totalDebt > 0 ? Math.min(100, Math.max(0, (totalPaid / totalDebt) * 100)) : (balance <= 0 ? 100 : 0);

    return {
      totalDebt,
      totalPaid,
      balance: balance < 0.0001 && balance > -0.0001 ? 0 : balance, // avoid floating point inaccuracy
      payoffRate
    };
  }

  function calculateGlobalMetrics() {
    let totalIncurred = 0;
    let totalPaid = 0;
    let activeOwedCount = 0;

    for (const tx of transactions) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'debt') totalIncurred += amt;
      if (tx.type === 'payment') totalPaid += amt;
    }

    for (const p of partners) {
      const fin = calculatePartnerFinancials(p.id);
      if (fin.balance > 0.01) {
        activeOwedCount++;
      }
    }

    const netOwed = Math.max(0, totalIncurred - totalPaid);
    const paybackRate = totalIncurred > 0 ? (totalPaid / totalIncurred) * 100 : 0;

    return {
      totalIncurred,
      totalPaid,
      netOwed,
      paybackRate: paybackRate.toFixed(1),
      partnersCount: partners.length,
      activeOwedCount,
      transactionsCount: transactions.length
    };
  }

  /* ==========================================================================
     UI Rendering
     ========================================================================== */
  function renderAll() {
    renderMetrics();
    renderPartnerDropdowns();
    renderCalculator();
    renderPartnersGrid();
    renderLedgerTable();
  }

  function renderMetrics() {
    const m = calculateGlobalMetrics();
    el.metricTotalOwed.textContent = formatMoney(m.netOwed);
    el.metricTotalPaid.textContent = formatMoney(m.totalPaid);
    el.metricPaybackRate.textContent = `${m.paybackRate}% of total debts cleared`;
    el.metricTotalIncurred.textContent = formatMoney(m.totalIncurred);
    el.metricTransactionCount.textContent = `${m.transactionsCount} ledger entries recorded`;
    el.metricPartnersCount.textContent = m.partnersCount;
    el.metricActiveOwedCount.textContent = `${m.activeOwedCount} with pending balance`;
  }

  function renderPartnerDropdowns() {
    // Current selections preserved if possible
    const currentCalcSelected = el.calcPartnerSelect.value;
    const currentFilterSelected = el.filterPartner.value;
    const currentTxSelected = el.txPartner.value;

    // Calc Select
    el.calcPartnerSelect.innerHTML = '<option value="">Choose partner / wholesaler...</option>';
    // Tx Select
    el.txPartner.innerHTML = '<option value="">Select partner / wholesaler...</option>';
    // Filter Select
    el.filterPartner.innerHTML = '<option value="all">All Partners</option>';

    // Sort partners alphabetically
    const sortedPartners = [...partners].sort((a, b) => a.name.localeCompare(b.name));

    for (const p of sortedPartners) {
      const fin = calculatePartnerFinancials(p.id);
      const balanceLabel = fin.balance > 0 ? ` (Owes ${formatMoney(fin.balance)})` : ' (Settled)';

      // Calc options
      const optCalc = document.createElement('option');
      optCalc.value = p.id;
      optCalc.textContent = `${p.name}${balanceLabel}`;
      el.calcPartnerSelect.appendChild(optCalc);

      // Modal options
      const optTx = document.createElement('option');
      optTx.value = p.id;
      optTx.textContent = p.name;
      el.txPartner.appendChild(optTx);

      // Filter options
      const optFilter = document.createElement('option');
      optFilter.value = p.id;
      optFilter.textContent = p.name;
      el.filterPartner.appendChild(optFilter);
    }

    if (currentCalcSelected && partners.some(p => p.id === currentCalcSelected)) {
      el.calcPartnerSelect.value = currentCalcSelected;
    }
    if (currentFilterSelected && (currentFilterSelected === 'all' || partners.some(p => p.id === currentFilterSelected))) {
      el.filterPartner.value = currentFilterSelected;
    }
    if (currentTxSelected && partners.some(p => p.id === currentTxSelected)) {
      el.txPartner.value = currentTxSelected;
    }
  }

  function renderCalculator() {
    const selectedPartnerId = el.calcPartnerSelect.value;
    const amountVal = parseFloat(el.calcAmountInput.value) || 0;

    if (!selectedPartnerId) {
      el.calcCurrentOwed.textContent = '$0.00';
      el.calcNewBalance.textContent = '$0.00';
      el.calcRecordPaymentBtn.disabled = true;
      return;
    }

    const fin = calculatePartnerFinancials(selectedPartnerId);
    el.calcCurrentOwed.textContent = formatMoney(fin.balance);

    const projectedBalance = Math.max(0, fin.balance - amountVal);
    el.calcNewBalance.textContent = formatMoney(projectedBalance);

    if (projectedBalance === 0 && fin.balance > 0 && amountVal > 0) {
      el.calcNewBalance.classList.add('highlight');
    } else {
      el.calcNewBalance.classList.remove('highlight');
    }

    el.calcRecordPaymentBtn.disabled = amountVal <= 0 || fin.balance <= 0;
  }

  function renderPartnersGrid() {
    const query = (el.partnerSearchInput.value || '').trim().toLowerCase();
    const filteredPartners = partners.filter(p => {
      if (!query) return true;
      return p.name.toLowerCase().includes(query) ||
             (p.category && p.category.toLowerCase().includes(query)) ||
             (p.notes && p.notes.toLowerCase().includes(query));
    });

    el.partnersGrid.innerHTML = '';

    if (filteredPartners.length === 0) {
      el.partnersGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 2.5rem 1rem;">
          <p>No partners or wholesalers found. Click "+ Add Partner" to create one.</p>
        </div>
      `;
      return;
    }

    for (const p of filteredPartners) {
      const fin = calculatePartnerFinancials(p.id);
      const isSettled = fin.balance <= 0.001;

      const card = document.createElement('div');
      card.className = 'partner-card';
      card.dataset.partnerId = p.id;

      card.innerHTML = `
        <div class="partner-top">
          <div class="partner-info">
            <div class="partner-title-row">
              <h4>${sanitize(p.name)}</h4>
              <span class="status-pill ${isSettled ? 'status-pill-settled' : 'status-pill-owing'}">
                ${isSettled ? 'Paid in Full' : 'Pending Balance'}
              </span>
            </div>
            <span class="partner-category-badge">${sanitize(p.category || 'Wholesaler')}</span>
          </div>
          <div class="partner-actions-menu">
            <button class="btn btn-icon btn-xs edit-partner-btn" title="Edit Partner" aria-label="Edit Partner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="btn btn-icon btn-xs delete-partner-btn text-danger" title="Delete Partner" aria-label="Delete Partner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>

        <div class="partner-balance-box">
          <div>
            <div class="balance-title">${isSettled ? 'Status' : 'Balance Owed'}</div>
            <div class="partner-balance ${isSettled ? 'settled' : 'owing'}">
              ${isSettled ? 'Paid in Full' : formatMoney(fin.balance)}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.72rem; color: var(--text-dim);">Total Incurred</div>
            <div style="font-weight: 600; font-size: 0.85rem;">${formatMoney(fin.totalDebt)}</div>
          </div>
        </div>

        <div class="payoff-progress-wrap">
          <div class="progress-header">
            <span>Paid Back: <strong>${formatMoney(fin.totalPaid)}</strong></span>
            <span><strong>${fin.payoffRate.toFixed(0)}%</strong></span>
          </div>
          <div class="progress-track">
            <div class="progress-bar-fill" style="width: ${fin.payoffRate}%;"></div>
          </div>
        </div>

        ${p.phone || p.notes ? `
          <div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4;">
            ${p.phone ? `<div>📞 ${sanitize(p.phone)}</div>` : ''}
            ${p.notes ? `<div style="margin-top: 2px;">📝 ${sanitize(p.notes)}</div>` : ''}
          </div>
        ` : ''}

        <div class="partner-card-footer">
          <button class="btn btn-secondary btn-sm quick-add-debt" title="Record new debt from this partner">
            + Owe
          </button>
          <button class="btn ${isSettled ? 'btn-secondary' : 'btn-emerald'} btn-sm quick-add-payment" title="Record payment back to this partner">
            Pay Back
          </button>
        </div>
      `;

      // Event handlers on partner card
      card.querySelector('.edit-partner-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditPartnerModal(p.id);
      });

      card.querySelector('.delete-partner-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deletePartner(p.id);
      });

      card.querySelector('.quick-add-debt').addEventListener('click', (e) => {
        e.stopPropagation();
        openNewTransactionModal({ partnerId: p.id, type: 'debt' });
      });

      card.querySelector('.quick-add-payment').addEventListener('click', (e) => {
        e.stopPropagation();
        openNewTransactionModal({ 
          partnerId: p.id, 
          type: 'payment',
          amount: fin.balance > 0 ? fin.balance : ''
        });
      });

      el.partnersGrid.appendChild(card);
    }
  }

  function renderLedgerTable() {
    const partnerFilter = el.filterPartner.value;
    const typeFilter = el.filterType.value;
    const query = (el.ledgerSearchInput.value || '').trim().toLowerCase();

    // Map partner names for quick lookup
    const partnerMap = new Map();
    for (const p of partners) {
      partnerMap.set(p.id, p);
    }

    // Filter transactions
    const filteredTxs = transactions.filter(tx => {
      if (partnerFilter !== 'all' && tx.partnerId !== partnerFilter) return false;
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (query) {
        const p = partnerMap.get(tx.partnerId);
        const pName = p ? p.name.toLowerCase() : '';
        const ref = (tx.reference || '').toLowerCase();
        const cat = (tx.category || '').toLowerCase();
        const notes = (tx.notes || '').toLowerCase();
        if (!pName.includes(query) && !ref.includes(query) && !cat.includes(query) && !notes.includes(query)) {
          return false;
        }
      }
      return true;
    });

    // Sort by date descending (newest first)
    filteredTxs.sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt));

    el.ledgerTableBody.innerHTML = '';

    if (filteredTxs.length === 0) {
      el.ledgerTable.style.display = 'none';
      el.ledgerEmptyState.style.display = 'block';
      return;
    }

    el.ledgerTable.style.display = 'table';
    el.ledgerEmptyState.style.display = 'none';

    for (const tx of filteredTxs) {
      const partner = partnerMap.get(tx.partnerId) || { name: 'Unknown Partner' };
      const isDebt = tx.type === 'debt';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="white-space: nowrap;">
          <span style="font-weight: 600;">${formatDate(tx.date)}</span>
        </td>
        <td>
          <strong>${sanitize(partner.name)}</strong>
        </td>
        <td>
          <span class="badge ${isDebt ? 'badge-debt' : 'badge-payment'}">
            ${isDebt ? '+ I Owe' : '✓ Paid Back'}
          </span>
        </td>
        <td>
          <span class="badge badge-category">${sanitize(tx.category || 'General')}</span>
          ${tx.reference ? `<span class="ref-code" title="Reference / Invoice">${sanitize(tx.reference)}</span>` : ''}
        </td>
        <td>
          <span style="color: var(--text-muted); font-size: 0.825rem;">${sanitize(tx.notes || '—')}</span>
        </td>
        <td class="text-right">
          <span class="tx-amount ${isDebt ? 'is-debt' : 'is-payment'}">
            ${isDebt ? '+' : '-'}${formatMoney(tx.amount)}
          </span>
        </td>
        <td class="text-right" style="white-space: nowrap;">
          <button class="btn btn-icon btn-xs delete-tx-btn text-danger" title="Delete entry" aria-label="Delete entry">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      `;

      tr.querySelector('.delete-tx-btn').addEventListener('click', () => {
        deleteTransaction(tx.id);
      });

      el.ledgerTableBody.appendChild(tr);
    }
  }

  /* ==========================================================================
     CRUD Operations
     ========================================================================== */
  function openAddPartnerModal() {
    el.partnerForm.reset();
    el.partnerEditId.value = '';
    el.partnerModalTitle.textContent = 'Add Business Partner / Wholesaler';
    openModal(el.partnerModal);
  }

  function openEditPartnerModal(id) {
    const p = partners.find(item => item.id === id);
    if (!p) return;

    el.partnerEditId.value = p.id;
    el.partnerName.value = p.name;
    el.partnerType.value = p.category || 'Wholesaler';
    el.partnerPhone.value = p.phone || '';
    el.partnerNotes.value = p.notes || '';
    el.partnerModalTitle.textContent = 'Edit Partner / Wholesaler';
    openModal(el.partnerModal);
  }

  function savePartner(e) {
    e.preventDefault();
    const name = el.partnerName.value.trim();
    if (!name) {
      showToast('Please enter partner name', 'error');
      return;
    }

    const editId = el.partnerEditId.value;
    if (editId) {
      const idx = partners.findIndex(p => p.id === editId);
      if (idx !== -1) {
        partners[idx].name = name;
        partners[idx].category = el.partnerType.value;
        partners[idx].phone = el.partnerPhone.value.trim();
        partners[idx].notes = el.partnerNotes.value.trim();
        showToast(`Updated partner "${name}"`, 'success');
      }
    } else {
      const newPartner = {
        id: generateId('p'),
        name,
        category: el.partnerType.value,
        phone: el.partnerPhone.value.trim(),
        notes: el.partnerNotes.value.trim(),
        createdAt: new Date().toISOString()
      };
      partners.push(newPartner);
      showToast(`Added partner "${name}"`, 'success');
    }

    saveState();
    closeModal(el.partnerModal);
    renderAll();
  }

  function deletePartner(id) {
    const p = partners.find(item => item.id === id);
    if (!p) return;

    const txCount = transactions.filter(t => t.partnerId === id).length;
    let confirmMsg = `Are you sure you want to remove "${p.name}"?`;
    if (txCount > 0) {
      confirmMsg += `\nWarning: This will also delete ${txCount} transaction(s) associated with them.`;
    }

    if (confirm(confirmMsg)) {
      partners = partners.filter(item => item.id !== id);
      transactions = transactions.filter(item => item.partnerId !== id);
      saveState();
      showToast(`Removed "${p.name}"`, 'info');
      renderAll();
    }
  }

  function openNewTransactionModal(prefill = {}) {
    if (partners.length === 0) {
      showToast('Please add at least one partner before recording an entry.', 'error');
      openAddPartnerModal();
      return;
    }

    el.transactionForm.reset();
    el.transactionEditId.value = '';
    el.txDate.value = getTodayString();
    el.transactionModalTitle.textContent = 'Record Ledger Entry';

    if (prefill.partnerId) {
      el.txPartner.value = prefill.partnerId;
    } else if (partners.length > 0) {
      el.txPartner.value = partners[0].id;
    }

    if (prefill.type === 'payment') {
      const radio = document.getElementById('txTypePayment');
      if (radio) radio.checked = true;
      el.txCategory.value = 'Repayment (Bank / Transfer)';
    } else {
      const radio = document.getElementById('txTypeDebt');
      if (radio) radio.checked = true;
      el.txCategory.value = 'Wholesale Batch';
    }

    if (prefill.amount) {
      el.txAmount.value = Number(prefill.amount).toFixed(2);
    }

    openModal(el.transactionModal);
  }

  function saveTransaction(e) {
    e.preventDefault();
    const partnerId = el.txPartner.value;
    const amount = parseFloat(el.txAmount.value);
    const date = el.txDate.value;
    const type = document.querySelector('input[name="txType"]:checked')?.value || 'debt';

    if (!partnerId) {
      showToast('Please select a partner', 'error');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount greater than $0', 'error');
      return;
    }
    if (!date) {
      showToast('Please select a date', 'error');
      return;
    }

    const newTx = {
      id: generateId('t'),
      partnerId,
      type,
      amount,
      date,
      category: el.txCategory.value,
      reference: el.txReference.value.trim(),
      notes: el.txNotes.value.trim(),
      createdAt: new Date().toISOString()
    };

    transactions.push(newTx);
    saveState();
    closeModal(el.transactionModal);
    
    const partner = partners.find(p => p.id === partnerId);
    const partnerName = partner ? partner.name : 'partner';
    if (type === 'payment') {
      showToast(`Recorded payment of ${formatMoney(amount)} to ${partnerName}`, 'success');
    } else {
      showToast(`Recorded ${formatMoney(amount)} owed to ${partnerName}`, 'info');
    }

    renderAll();
  }

  function deleteTransaction(id) {
    if (confirm('Delete this ledger entry?')) {
      transactions = transactions.filter(t => t.id !== id);
      saveState();
      showToast('Entry removed', 'info');
      renderAll();
    }
  }

  /* ==========================================================================
     Calculator Interactions
     ========================================================================== */
  function onCalcPartnerChange() {
    const partnerId = el.calcPartnerSelect.value;
    if (partnerId) {
      const fin = calculatePartnerFinancials(partnerId);
      if (fin.balance > 0) {
        el.calcAmountInput.placeholder = fin.balance.toFixed(2);
      } else {
        el.calcAmountInput.placeholder = '0.00';
      }
    }
    renderCalculator();
  }

  function onCalcPayInFull() {
    const partnerId = el.calcPartnerSelect.value;
    if (!partnerId) {
      showToast('Please select a partner first', 'info');
      return;
    }
    const fin = calculatePartnerFinancials(partnerId);
    if (fin.balance <= 0) {
      showToast('This partner is already fully paid off!', 'success');
      return;
    }
    el.calcAmountInput.value = fin.balance.toFixed(2);
    renderCalculator();
  }

  function onCalcApplyPayment() {
    const partnerId = el.calcPartnerSelect.value;
    const amount = parseFloat(el.calcAmountInput.value);

    if (!partnerId || isNaN(amount) || amount <= 0) {
      showToast('Please enter an amount to pay', 'error');
      return;
    }

    const partner = partners.find(p => p.id === partnerId);
    const partnerName = partner ? partner.name : 'Wholesaler';

    const newTx = {
      id: generateId('t'),
      partnerId,
      type: 'payment',
      amount,
      date: getTodayString(),
      category: 'Repayment (Bank / Transfer)',
      reference: 'Direct Payoff Calc',
      notes: `Payment recorded via Payoff Calculator`,
      createdAt: new Date().toISOString()
    };

    transactions.push(newTx);
    saveState();
    el.calcAmountInput.value = '';
    showToast(`Successfully recorded payment of ${formatMoney(amount)} to ${partnerName}`, 'success');
    renderAll();
  }

  /* ==========================================================================
     Modal Handlers
     ========================================================================== */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ==========================================================================
     Data Import / Export / Backup
     ========================================================================== */
  function exportJson() {
    const data = {
      app: 'PaidOff',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      partners,
      transactions
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PaidOff_Backup_${getTodayString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('JSON Backup downloaded', 'success');
  }

  function exportCsv() {
    const partnerMap = new Map(partners.map(p => [p.id, p.name]));
    const headers = ['Date', 'Partner / Wholesaler', 'Type', 'Amount', 'Category', 'Reference', 'Notes'];

    const rows = transactions.map(t => {
      const pName = partnerMap.get(t.partnerId) || 'Unknown';
      const escape = str => `"${(str || '').replace(/"/g, '""')}"`;
      return [
        t.date,
        escape(pName),
        t.type === 'debt' ? 'OWED' : 'PAID',
        Number(t.amount).toFixed(2),
        escape(t.category),
        escape(t.reference),
        escape(t.notes)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PaidOff_Ledger_${getTodayString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV Ledger downloaded', 'success');
  }

  function importJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (Array.isArray(parsed.partners) && Array.isArray(parsed.transactions)) {
          if (confirm(`Import ${parsed.partners.length} partners and ${parsed.transactions.length} transactions? This will merge with or replace current data.`)) {
            partners = parsed.partners;
            transactions = parsed.transactions;
            saveState();
            renderAll();
            showToast('Backup restored successfully!', 'success');
          }
        } else {
          showToast('Invalid backup file format.', 'error');
        }
      } catch (err) {
        showToast('Failed to parse JSON file.', 'error');
      }
      e.target.value = ''; // reset file input
    };
    reader.readAsText(file);
  }

  function loadSampleData() {
    if (confirm('Load demo sample data? This will add realistic wholesalers and transactions.')) {
      partners = [...SAMPLE_DATA.partners];
      transactions = [...SAMPLE_DATA.transactions];
      saveState();
      renderAll();
      showToast('Sample demo data loaded!', 'success');
    }
  }

  function clearAllData() {
    if (confirm('WARNING: Are you sure you want to delete ALL partners and transactions? This cannot be undone.')) {
      partners = [];
      transactions = [];
      saveState();
      renderAll();
      showToast('All data cleared.', 'info');
    }
  }

  /* ==========================================================================
     Theme Management
     ========================================================================== */
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    document.body.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  }

  /* ==========================================================================
     Event Listeners Setup
     ========================================================================== */
  function setupEventListeners() {
    // Theme toggle
    el.themeToggleBtn.addEventListener('click', toggleTheme);

    // Data dropdown
    el.dataMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      el.dataMenuDropdown.parentElement.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      el.dataMenuDropdown.parentElement.classList.remove('open');
    });

    el.exportJsonBtn.addEventListener('click', exportJson);
    el.exportCsvBtn.addEventListener('click', exportCsv);
    el.importJsonInput.addEventListener('change', importJson);
    el.loadSampleDataBtn.addEventListener('click', loadSampleData);
    el.clearAllDataBtn.addEventListener('click', clearAllData);
    el.printStatementBtn.addEventListener('click', () => window.print());

    // Modal Triggers
    el.openNewPartnerBtn.addEventListener('click', openAddPartnerModal);
    el.openNewTransactionBtn.addEventListener('click', () => openNewTransactionModal());

    // Modal Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        closeModal(document.getElementById(modalId));
      });
    });

    // Close on backdrop click
    [el.partnerModal, el.transactionModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal(el.partnerModal);
        closeModal(el.transactionModal);
        el.dataMenuDropdown.parentElement.classList.remove('open');
      }
    });

    // Form submissions
    el.partnerForm.addEventListener('submit', savePartner);
    el.transactionForm.addEventListener('submit', saveTransaction);

    // Payoff Calculator inputs
    el.calcPartnerSelect.addEventListener('change', onCalcPartnerChange);
    el.calcAmountInput.addEventListener('input', renderCalculator);
    el.calcFullPayBtn.addEventListener('click', onCalcPayInFull);
    el.calcRecordPaymentBtn.addEventListener('click', onCalcApplyPayment);

    // Search and Filters
    el.partnerSearchInput.addEventListener('input', renderPartnersGrid);
    el.filterPartner.addEventListener('change', renderLedgerTable);
    el.filterType.addEventListener('change', renderLedgerTable);
    el.ledgerSearchInput.addEventListener('input', renderLedgerTable);
  }

  /* ==========================================================================
     Application Bootstrapper
     ========================================================================== */
  function init() {
    initTheme();
    loadState();
    setupEventListeners();
    renderAll();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
