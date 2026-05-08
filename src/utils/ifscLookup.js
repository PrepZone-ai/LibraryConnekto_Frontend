export async function lookupBankByIfsc(ifscInput) {
  const ifsc = (ifscInput || '').trim().toUpperCase();
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

  if (!ifsc) {
    return { ifsc: '', bankName: '', branchName: '' };
  }
  if (!ifscRegex.test(ifsc)) {
    throw new Error('Invalid IFSC format');
  }

  const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
  if (!response.ok) {
    throw new Error('IFSC not found');
  }

  const data = await response.json();
  return {
    ifsc,
    bankName: data.BANK || '',
    branchName: data.BRANCH || '',
  };
}
