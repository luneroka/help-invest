import React, { useState } from 'react'
import Layout from '../layout/Layout'
import MainHeader from '../headers/MainHeader'
import TransactionForm from './TransactionForm'

function Transactions() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleTransaction = async (transactionData) => {
        setIsLoading(true);
        setMessage(null);

        try {
            // TODO: Replace with actual API call
            console.log('Transaction data:', transactionData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock success response
            setMessage({
                type: 'success',
                text: `${transactionData.actionType === 'withdraw' ? 'Retrait' : 'Dépôt'} de ${transactionData.amount}€ effectué avec succès!`
            });

        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Une erreur est survenue. Veuillez réessayer.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout header={<MainHeader />}>
            <div className="flex flex-col items-center min-h-full">

                {/* Success/Error Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg w-full max-w-4xl text-center ${message.type === 'success' ? 'alert-success' : 'alert-error'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Transaction Forms */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl">
                    <TransactionForm
                        title="Investir"
                        actionType="deposit"
                        onSubmit={handleTransaction}
                        isLoading={isLoading}
                    />

                    <TransactionForm
                        title="Retirer"
                        actionType="withdraw"
                        onSubmit={handleTransaction}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </Layout>
    )
}

export default Transactions