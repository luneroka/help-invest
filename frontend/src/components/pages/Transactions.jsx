import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authorizedRequest } from '../../utils/authorizedRequest'
import Layout from '../layout/Layout'
import MainHeader from '../headers/MainHeader'
import TransactionForm from '../elements/TransactionForm'

function Transactions() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  const handleTransaction = async (transactionData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      if (transactionData.actionType === 'deposit') {
        // Handle investment (deposit)
        const response = await authorizedRequest({
          method: 'post',
          url: `${import.meta.env.VITE_API_BASE_URL}/api/invest`,
          data: {
            categoryName: transactionData.category,
            subCategory: transactionData.subCategory,
            amount: transactionData.amount
          },
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.data.success) {
          setMessage({
            type: 'success',
            text: response.data.message
          })

          // Redirect to dashboard after successful investment
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        }
      } else if (transactionData.actionType === 'withdraw') {
        // Handle withdrawal
        const response = await authorizedRequest({
          method: 'post',
          url: `${import.meta.env.VITE_API_BASE_URL}/api/withdraw`,
          data: {
            categoryName: transactionData.category,
            subCategory: transactionData.subCategory,
            amount: transactionData.amount
          },
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.data.success) {
          setMessage({
            type: 'success',
            text: response.data.message
          })

          // Redirect to dashboard after successful withdrawal
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Transaction error:', error)

      if (error.response?.status === 401) {
        navigate('/connexion')
      } else if (error.response?.data?.message) {
        setMessage({
          type: 'error',
          text: error.response.data.message
        })
      } else {
        setMessage({
          type: 'error',
          text: 'Une erreur est survenue. Veuillez réessayer.'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout header={<MainHeader />}>
      <div className='flex flex-col items-center min-h-full'>
        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg w-full max-w-4xl text-center ${
              message.type === 'success' ? 'alert-success' : 'alert-error'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Transaction Forms */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl place-items-center'>
          <TransactionForm
            title='Investir'
            actionType='deposit'
            onSubmit={handleTransaction}
            isLoading={isLoading}
          />

          <TransactionForm
            title='Retirer'
            actionType='withdraw'
            onSubmit={handleTransaction}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Transactions
