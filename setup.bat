@echo off
echo Starting Hardhat node and deploying contracts...

start cmd /k npx hardhat node
timeout /t 5

echo Deploying contracts to local network...
npx hardhat run scripts/deploy-and-setup.js --network localhost

echo Setup complete! You can now run the application with 'npm start'
