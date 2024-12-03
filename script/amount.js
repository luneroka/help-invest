const amountInput = document.getElementById('amount');

amountInput.addEventListener('input', (e) => {
  // Remove all non-numeric characters
  let value = e.target.value.replace(/[^0-9]/g, '');

  // Format the number as a dollar amount without decimals
  if (value) {
    e.target.value = `$${new Intl.NumberFormat('en-US').format(value)}`;
  } else {
    e.target.value = ''; // Clear if no value
  }
});

amountInput.addEventListener('blur', (e) => {
  // Ensure the field includes a dollar sign on blur
  if (!e.target.value.startsWith('$') && e.target.value !== '') {
    e.target.value = `$${e.target.value}`;
  }
});
