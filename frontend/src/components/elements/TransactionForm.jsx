import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { formatNumber } from '../../utils/helpers'

export default function TransactionForm({
  title,
  actionType,
  onSubmit,
  isLoading
}) {
  const [formData, setFormData] = useState({
    amount: '',
    displayAmount: '',
    categoryName: '',
    subCategory: ''
  })

  const [errors, setErrors] = useState({})
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [availableBalances, setAvailableBalances] = useState({})
  const [loadingCategories, setLoadingCategories] = useState(false)
  const navigate = useNavigate()

  // Fetch categories and portfolio data on component mount
  useEffect(() => {
    fetchCategories()
    if (actionType === 'withdraw') {
      fetchPortfolioBalances()
    }
  }, [actionType])

  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const endpoint =
        actionType === 'withdraw'
          ? `${import.meta.env.VITE_API_BASE_URL}/api/withdraw`
          : `${import.meta.env.VITE_API_BASE_URL}/api/invest`

      const response = await axios.get(endpoint, {
        withCredentials: true
      })

      if (response.data.success) {
        if (actionType === 'withdraw') {
          // For withdrawals, use withdraw_categories data
          setCategories(response.data.withdraw_categories || [])
        } else {
          // For deposits, use all_categories data
          setCategories(response.data.all_categories || [])
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      if (error.response?.status === 401) {
        navigate('/connexion')
      }
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchPortfolioBalances = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/dashboard`,
        {
          withCredentials: true
        }
      )

      if (response.data.success) {
        const portfolioSummary = response.data.portfolio_summary || {}
        const balances = {}

        // Convert portfolio summary to balance lookup
        Object.entries(portfolioSummary).forEach(([category, data]) => {
          Object.entries(data.sub_categories).forEach(
            ([subCategory, amount]) => {
              balances[`${category}-${subCategory}`] = amount
            }
          )
        })

        setAvailableBalances(balances)
      }
    } catch (error) {
      console.error('Error fetching portfolio balances:', error)
      if (error.response?.status === 401) {
        navigate('/connexion')
      }
    }
  }

  const handleAmountChange = (e) => {
    const inputValue = e.target.value
    // Remove all non-digit characters
    const numericValue = inputValue.replace(/\D/g, '')

    // Update both raw and formatted values
    setFormData((prev) => ({
      ...prev,
      amount: numericValue,
      displayAmount: numericValue ? formatNumber(parseInt(numericValue)) : ''
    }))

    // Clear error when user starts typing
    if (errors.amount) {
      setErrors((prev) => ({
        ...prev,
        amount: ''
      }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    // Handle amount separately
    if (name === 'amount') {
      handleAmountChange(e)
      return
    }

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
      const filteredSubCategories = categories.filter((cat) => {
        if (actionType === 'withdraw') {
          return cat.category === value
        } else {
          return cat.name === value || cat.category_name === value
        }
      })
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

    // Additional validation for withdrawals - use the balance from the categories data
    if (
      actionType === 'withdraw' &&
      formData.amount &&
      formData.categoryName &&
      formData.subCategory
    ) {
      // Find the selected category/subcategory combination
      const selectedCategory = categories.find(
        (cat) =>
          cat.category === formData.categoryName &&
          cat.sub_category === formData.subCategory
      )

      if (selectedCategory) {
        const availableBalance = selectedCategory.balance || 0
        if (parseFloat(formData.amount) > availableBalance) {
          newErrors.amount = `Solde insuffisant (disponible: ${formatNumber(availableBalance)}€)`
        }
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

    // Pass form data with correct field names for API
    onSubmit({
      actionType,
      category: formData.categoryName, // Map to 'category' for API
      subCategory: formData.subCategory, // Keep as 'subCategory' for API
      amount: parseInt(formData.amount)
    })
  }

  const isWithdraw = actionType === 'withdraw'

  // Get unique categories from the API response
  const uniqueCategories = [
    ...new Set(
      categories.map((cat) => {
        if (actionType === 'withdraw') {
          return cat.category
        } else {
          return cat.name || cat.category_name
        }
      })
    )
  ]

  const currentBalance =
    isWithdraw && formData.categoryName && formData.subCategory
      ? (() => {
          const selectedCategory = categories.find(
            (cat) =>
              cat.category === formData.categoryName &&
              cat.sub_category === formData.subCategory
          )
          return selectedCategory ? selectedCategory.balance : null
        })()
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
            disabled={isLoading || loadingCategories}
          >
            <option value='' disabled>
              {loadingCategories
                ? 'Chargement...'
                : 'Sélectionner une catégorie'}
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
                {actionType === 'withdraw' &&
                  cat.balance &&
                  ` (${formatNumber(cat.balance)}€)`}
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
            <div className='p-3 bg-gray-100'>
              <span className='text-small text-gray-600'>
                Solde disponible :{' '}
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
            type='text'
            name='amount'
            id={`amount-${actionType}`}
            value={formData.displayAmount}
            onChange={handleAmountChange}
            placeholder='0'
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
          disabled={isLoading || loadingCategories}
        >
          {isLoading ? 'Traitement...' : title}
        </button>
      </form>
    </div>
  )
}
