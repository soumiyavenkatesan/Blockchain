@echo off
echo Minting tokens to the specified address...

if "%1"=="" (
  echo Usage: mint-tokens.bat [address]
  echo Example: mint-tokens.bat 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  exit /b 1
)

npx hardhat run scripts/mint-tokens.js --network localhost -- %1

echo Done!
