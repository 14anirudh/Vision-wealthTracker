import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Portfolio from './models/Portfolio.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio-tracker';

const samplePortfolio = {
    userId: 'default',
    equity: {
        directStocks: [
            { name: 'Reliance Industries', invested: 45000, current: 50000 },
            { name: 'TCS', invested: 40000, current: 45000 },
            { name: 'HDFC Bank', invested: 35000, current: 37000 },
            { name: 'Infosys', invested: 38000, current: 40000 }
        ],
        mutualFunds: [
            { name: 'Parag Parikh Flexi Cap', type: 'Flexi Cap', invested: 55000, current: 60000 },
            { name: 'Axis Mid Cap Fund', type: 'Mid Cap', invested: 42000, current: 45000 },
            { name: 'SBI Small Cap Fund', type: 'Small Cap', invested: 30000, current: 35000 },
            { name: 'Nifty 50 Index Fund', type: 'Index Fund', invested: 48000, current: 50000 }
        ]
    },
    nonEquity: {
        cash: {
            invested: 25000,
            current: 25000
        },
        commodities: {
            gold: {
                invested: 70000,
                current: 75000
            },
            silver: {
                invested: 23000,
                current: 25000
            }
        },
        fixedIncomeAssets: [
            { name: 'Fixed Deposit - SBI', invested: 100000, current: 105000 },
            { name: 'Corporate Bonds', invested: 50000, current: 52000 },
            { name: 'PPF', invested: 75000, current: 80000 }
        ]
    },
    emergency: {
        invested: {
            investedAmount: 95000,
            currentAmount: 100000
        },
        bankAccount: {
            investedAmount: 50000,
            currentAmount: 50000
        }
    }
};

const seedDatabase = async() => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing portfolios
        console.log('Clearing existing portfolios...');
        await Portfolio.deleteMany({});

        // Create sample portfolio
        console.log('Creating sample portfolio...');
        const portfolio = new Portfolio(samplePortfolio);
        await portfolio.save();

        console.log('\n✅ Sample portfolio created successfully!');
        console.log('='.repeat(60));
        console.log('\n📊 PORTFOLIO SUMMARY');
        console.log('='.repeat(60));

        // Equity Summary
        const stocksInvested = portfolio.equity.directStocks.reduce((sum, s) => sum + s.invested, 0);
        const stocksCurrent = portfolio.equity.directStocks.reduce((sum, s) => sum + s.current, 0);
        const stocksGain = stocksCurrent - stocksInvested;
        const stocksGainPct = ((stocksGain / stocksInvested) * 100).toFixed(2);

        const mfInvested = portfolio.equity.mutualFunds.reduce((sum, mf) => sum + mf.invested, 0);
        const mfCurrent = portfolio.equity.mutualFunds.reduce((sum, mf) => sum + mf.current, 0);
        const mfGain = mfCurrent - mfInvested;
        const mfGainPct = ((mfGain / mfInvested) * 100).toFixed(2);

        console.log('\n💼 EQUITY TOTAL: ₹' + portfolio.equity.total.toLocaleString());
        console.log('   Direct Stocks:');
        console.log(`     Invested: ₹${stocksInvested.toLocaleString()}`);
        console.log(`     Current:  ₹${stocksCurrent.toLocaleString()}`);
        console.log(`     Gain:     ₹${stocksGain.toLocaleString()} (${stocksGainPct}%)`);
        console.log('   Mutual Funds:');
        console.log(`     Invested: ₹${mfInvested.toLocaleString()}`);
        console.log(`     Current:  ₹${mfCurrent.toLocaleString()}`);
        console.log(`     Gain:     ₹${mfGain.toLocaleString()} (${mfGainPct}%)`);

        // Non-Equity Summary
        console.log('\n🏦 NON-EQUITY TOTAL: ₹' + portfolio.nonEquity.total.toLocaleString());
        console.log(`   Invested: ₹${portfolio.nonEquity.totalInvested.toLocaleString()}`);

        const cashGain = portfolio.nonEquity.cash.current - portfolio.nonEquity.cash.invested;
        const goldGain = portfolio.nonEquity.commodities.gold.current - portfolio.nonEquity.commodities.gold.invested;
        const silverGain = portfolio.nonEquity.commodities.silver.current - portfolio.nonEquity.commodities.silver.invested;

        console.log('   Cash:');
        console.log(`     ₹${portfolio.nonEquity.cash.invested.toLocaleString()} → ₹${portfolio.nonEquity.cash.current.toLocaleString()} (${cashGain >= 0 ? '+' : ''}₹${cashGain.toLocaleString()})`);
        console.log('   Gold:');
        console.log(`     ₹${portfolio.nonEquity.commodities.gold.invested.toLocaleString()} → ₹${portfolio.nonEquity.commodities.gold.current.toLocaleString()} (${goldGain >= 0 ? '+' : ''}₹${goldGain.toLocaleString()})`);
        console.log('   Silver:');
        console.log(`     ₹${portfolio.nonEquity.commodities.silver.invested.toLocaleString()} → ₹${portfolio.nonEquity.commodities.silver.current.toLocaleString()} (${silverGain >= 0 ? '+' : ''}₹${silverGain.toLocaleString()})`);

        const fixedIncomeInvested = portfolio.nonEquity.fixedIncomeAssets.reduce((sum, f) => sum + f.invested, 0);
        const fixedIncomeCurrent = portfolio.nonEquity.fixedIncomeAssets.reduce((sum, f) => sum + f.current, 0);
        const fixedIncomeGain = fixedIncomeCurrent - fixedIncomeInvested;
        console.log('   Fixed Income:');
        console.log(`     ₹${fixedIncomeInvested.toLocaleString()} → ₹${fixedIncomeCurrent.toLocaleString()} (${fixedIncomeGain >= 0 ? '+' : ''}₹${fixedIncomeGain.toLocaleString()})`);

        // Emergency Fund Summary
        console.log('\n🚨 EMERGENCY FUND TOTAL: ₹' + portfolio.emergency.total.toLocaleString());
        console.log(`   Invested: ₹${portfolio.emergency.totalInvested.toLocaleString()}`);

        const emergencyInvestedGain = portfolio.emergency.invested.currentAmount - portfolio.emergency.invested.investedAmount;
        const emergencyBankGain = portfolio.emergency.bankAccount.currentAmount - portfolio.emergency.bankAccount.investedAmount;
        console.log('   Invested (Emergency):');
        console.log(`     ₹${portfolio.emergency.invested.investedAmount.toLocaleString()} → ₹${portfolio.emergency.invested.currentAmount.toLocaleString()} (${emergencyInvestedGain >= 0 ? '+' : ''}₹${emergencyInvestedGain.toLocaleString()})`);
        console.log('   Bank Account:');
        console.log(`     ₹${portfolio.emergency.bankAccount.investedAmount.toLocaleString()} → ₹${portfolio.emergency.bankAccount.currentAmount.toLocaleString()} (${emergencyBankGain >= 0 ? '+' : ''}₹${emergencyBankGain.toLocaleString()})`);

        // Overall Summary
        const overallGain = portfolio.grandTotal - portfolio.invested;
        const overallGainPct = ((overallGain / portfolio.invested) * 100).toFixed(2);

        console.log('\n' + '='.repeat(60));
        console.log('💰 GRAND TOTAL: ₹' + portfolio.grandTotal.toLocaleString());
        console.log(`   Total Invested: ₹${portfolio.invested.toLocaleString()}`);
        console.log(`   Total Gain: ₹${overallGain.toLocaleString()} (${overallGainPct}%)`);
        console.log('='.repeat(60));

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        console.log('\n🚀 Start the app with: npm run dev\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();