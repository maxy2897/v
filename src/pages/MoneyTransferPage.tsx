import React from 'react';
import MoneyTransfer from '../components/MoneyTransfer';
import { motion } from 'framer-motion';

const MoneyTransferPage: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <MoneyTransfer />
        </motion.div>
    );
};

export default MoneyTransferPage;
