import React, { useState, useEffect } from 'react'
import { formatNumber } from '../../utils/helpers'

export default function TransactionForm({
  title,
  actionType,
  onSubmit,
  isLoading
}) {
  const [formData, setFormData] = useState({
    amount: '',
    categoryName: '',
    subCategory: ''
  })

  const [errors, setErrors] = useState({})
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [availableBalances, setAvailableBalances] = useState({})

  // Fetch categories and portfolio data on component mount
  useEffect(() => {
    fetchCategories()
    if (actionType === 'withdraw') {
      fetchPortfolioBalances()
    }
  }, [actionType])

  const fetchCategories = async () => {
    try {
      // TODO: Replace with actual API call to get categories
      // For now, using mock data based on backend structure
      const mockCategories = [
        { category_name: 'Épargne', sub_category: 'Espèces' },
        { category_name: 'Épargne', sub_category: 'Livret A' },
        { category_name: 'Immobilier', sub_category: 'Immobilier Locatif' },
        {
          category_name: 'Immobilier',
          sub_category: 'Crowdfunding Immobilier'
        },
        { category_name: 'Actions', sub_category: 'Actions' },
        { category_name: 'Actions', sub_category: 'Crypto' }
      ]
      setCategories(mockCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchPortfolioBalances = async () => {
    try {
      // TODO: Replace with actual API call to get portfolio balances
      // Mock data for withdraw functionality - keys match the actual categories
      const mockBalances = {
        'Épargne-Espèces': 2500,
        'Épargne-Livret A': 1500,
        'Immobilier-Immobilier Locatif': 15000,
        'Immobilier-Crowdfunding Immobilier': 800,
        'Actions-Actions': 2300,
        'Actions-Crypto': 500
      }
      setAvailableBalances(mockBalances)
    } catch (error) {
      console.error('Error fetching portfolio balances:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }

    // Update subcategories when category changes
    if (name === 'categoryName') {
      const filteredSubCategories = categories.filter(
        (cat) => cat.category_name === value
      )
      setSubCategories(filteredSubCategories)
      setFormData((prev) => ({
        ...prev,
        subCategory: '' // Reset subcategory when category changes
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Veuillez entrer un montant valide'
    }

    // Check if amount is a whole number
    if (formData.amount && !Number.isInteger(parseFloat(formData.amount))) {
      newErrors.amount = 'Veuillez entrer un montant entier (sans décimales)'
    }

    if (!formData.categoryName) {
      newErrors.categoryName = 'Veuillez sélectionner une catégorie'
    }

    if (!formData.subCategory) {
      newErrors.subCategory = 'Veuillez sélectionner un compte'
    }

    // Additional validation for withdrawals
    if (
      actionType === 'withdraw' &&
      formData.amount &&
      formData.categoryName &&
      formData.subCategory
    ) {
      const balanceKey = `${formData.categoryName}-${formData.subCategory}`
      const availableBalance = availableBalances[balanceKey] || 0

      if (parseFloat(formData.amount) > availableBalance) {
        newErrors.amount = `Solde insuffisant (disponible: ${formatNumber(availableBalance)}€)`
      }
    }

    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Pass form data with action type to parent
    onSubmit({
      ...formData,
      actionType,
      amount: parseInt(formData.amount)
    })
  }

  const isWithdraw = actionType === 'withdraw'
  const uniqueCategories = [
    ...new Set(categories.map((cat) => cat.category_name))
  ]
  const currentBalance =
    formData.categoryName && formData.subCategory
      ? availableBalances[`${formData.categoryName}-${formData.subCategory}`]
      : null

  return (
    <div className='card'>
      <h2
        className={
          title === 'Investir'
            ? 'text-theme-secondary text-center'
            : 'text-theme-primary text-center'
        }
      >
        {title}
      </h2>

      <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
        {/* Category Selection */}
        <div className='flex flex-col gap-2'>
          <label
            htmlFor={`category-${actionType}`}
            className='block text-small'
          >
            Catégorie
          </label>
          <select
            name='categoryName'
            id={`category-${actionType}`}
            value={formData.categoryName}
            onChange={handleChange}
            className='input-field input-field:focus w-full'
            disabled={isLoading}
          >
            <option value='' disabled>
              Sélectionner une catégorie
            </option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.categoryName && (
            <span className='text-small text-red-500'>
              {errors.categoryName}
            </span>
          )}
        </div>

        {/* Sub-category Selection */}
        <div className='flex flex-col gap-2'>
          <label
            htmlFor={`subcategory-${actionType}`}
            className='block text-small'
          >
            Compte
          </label>
          <select
            name='subCategory'
            id={`subcategory-${actionType}`}
            value={formData.subCategory}
            onChange={handleChange}
            className='input-field input-field:focus w-full'
            disabled={isLoading || !formData.categoryName}
          >
            <option value='' disabled>
              Sélectionner un compte
            </option>
            {subCategories.map((cat) => (
              <option key={cat.sub_category} value={cat.sub_category}>
                {cat.sub_category}
              </option>
            ))}
          </select>
          {errors.subCategory && (
            <span className='text-small text-red-500'>
              {errors.subCategory}
            </span>
          )}
        </div>

        {/* Current Balance Display (for withdrawals) */}
        {isWithdraw &&
          currentBalance !== null &&
          currentBalance !== undefined && (
            <div className='p-3 bg-gray-100 rounded-lg'>
              <span className='text-small text-gray-600'>
                Solde disponible:{' '}
                <span className='font-medium text-data'>
                  {formatNumber(currentBalance)}€
                </span>
              </span>
            </div>
          )}

        {/* Amount Input */}
        <div className='flex flex-col gap-2'>
          <label htmlFor={`amount-${actionType}`} className='block text-small'>
            Montant (€)
          </label>
          <input
            type='number'
            name='amount'
            id={`amount-${actionType}`}
            value={formData.amount}
            onChange={handleChange}
            placeholder='0'
            min='0'
            step='1'
            className='input-field input-field:focus w-full'
            disabled={isLoading}
          />
          {errors.amount && (
            <span className='text-small text-red-500'>{errors.amount}</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          className={`${isWithdraw ? 'btn-primary' : 'btn-secondary'} w-full`}
          disabled={isLoading}
        >
          {isLoading ? 'Traitement...' : title}
        </button>
      </form>
    </div>
  )
}
