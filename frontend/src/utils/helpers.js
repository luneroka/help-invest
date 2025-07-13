// Helper function to format numbers with thousand separators
export const formatNumber = (number) => {
  return new Intl.NumberFormat('fr-FR').format(number)
}
