import { Heading,HStack, VStack, IconButton, useColorMode, Button, Text, Tag, Input } from '@chakra-ui/react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { ethers } from 'ethers'; 
import { useState, useEffect } from 'react' 
import { Hyphen, SIGNATURE_TYPES } from '@biconomy/hyphen';
import { RESPONSE_CODES } from "@biconomy/hyphen";
import {config} from './config'

function App() {

  // states
  const [currAccount, setCurrentAccount] = useState('')
  const [chainId, setCurrentChainId] = useState('');
  const [bridgeValue, setBridgeValue] = useState('');

  const { colorMode, toggleColorMode } = useColorMode();

  const chainIDs = {
    '0x5': 'Goerli',
    '0x13881': 'Mumbai'
  }

  let hyphen = new Hyphen(window.ethereum, {
    debug: true,
    infiniteApproval: true,
    environment: 'test',
    signatureType: SIGNATURE_TYPES.EIP712
  });

  const checkIfWalletIsConnected = () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log(`Make sure you have Metamask!`);
      return;
    } else {
      console.log(`We have the ethereum object`, ethereum);
    }

    ethereum.request({ method: 'eth_accounts' })
      .then(accounts => {
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log(`Found an authorized account : ${account}`)
          setCurrentAccount(account)
        } else {
          console.log(`No authorized account found`)
        }
      })
  }

  const checkConnectedNetwork = () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log(`Make sure you have Metamask!`);
      return;
    } else {
      console.log(`We have the ethereum object`, ethereum);
    }

    ethereum.request({method:'eth_chainId'})
    .then(chainId => {
      console.log(`Connected chain ID is ${chainId}`);
      console.log(typeof chainId);
      if(chainId === '0x5' || chainId === '0x13881') {
        setCurrentChainId(chainId);
      } else {
        console.log('Wrong ID');
      }
    })
  }

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert('Get metamask!')
    }
    ethereum.request({ method: 'eth_requestAccounts' })
      .then(accounts => {
        console.log(`Connected ${accounts[0]}`)
        setCurrentAccount(accounts[0])
      })
      .catch(err => console.log(err));
  }

  const bridgeEthToMatic = async () => {
    await hyphen.init();

    let preTransferStatus = await hyphen.depositManager.preDepositStatus({
      tokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      amount: bridgeValue,
      fromChainId: "5",
      toChainId: "80001",
      userAddress: `${currAccount}`
  });

  console.log(preTransferStatus);


    if(preTransferStatus.code === RESPONSE_CODES.ALLOWANCE_NOT_GIVEN) {
      let approveTx = await hyphen.tokens.approveERC20(
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", 
        preTransferStatus.depositContract, 
        bridgeValue);
      await approveTx.wait(2);
    } if (preTransferStatus.code === RESPONSE_CODES.UNSUPPORTED_NETWORK) {
    } if (preTransferStatus.code === RESPONSE_CODES.NO_LIQUIDITY) {
    } if (preTransferStatus.code === RESPONSE_CODES.UNSUPPORTED_TOKEN) {
    } if (preTransferStatus.code === RESPONSE_CODES.OK) {

      let depositTx = await hyphen.depositManager.deposit({
        sender: `${currAccount}`,
        receiver: `${currAccount}`,
        tokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        depositContractAddress: "0xE61d38cC9B3eF1d223b177090f3FD02b0B3412e7",
        amount: bridgeValue,
        fromChainId: 5, 
        toChainId: 80001,
        useBiconomy: true, 
        tag: "Buildspace Eth Bridge"
      });

      await depositTx.wait(1);
    }

  }

  const bridgeMaticToEth = async () => {
    await hyphen.init();

    let preTransferStatus = await hyphen.depositManager.preDepositStatus({
      tokenAddress: "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
      amount: bridgeValue,
      fromChainId: "80001",
      toChainId: "5",
      userAddress: `${currAccount}`
  });

  if(preTransferStatus.code === RESPONSE_CODES.ALLOWANCE_NOT_GIVEN) {

    console.log('giving allowance');

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let contract = new ethers.Contract('0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa', config.contractABI, signer);

    let approveTx = await contract.approve(
      '0xb831F0848A055b146a0b13D54cfFa6C1FE201b83',
      bridgeValue);

    await approveTx.wait(2);
    
    console.log('allowance given');

    preTransferStatus = await hyphen.depositManager.preDepositStatus({
      tokenAddress: "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
      amount: bridgeValue,
      fromChainId: "80001",
      toChainId: "5",
      userAddress: `${currAccount}`
  });

  } if (preTransferStatus.code === RESPONSE_CODES.UNSUPPORTED_NETWORK) {
  } if (preTransferStatus.code === RESPONSE_CODES.NO_LIQUIDITY) {
  } if (preTransferStatus.code === RESPONSE_CODES.UNSUPPORTED_TOKEN) {
  } if (preTransferStatus.code === RESPONSE_CODES.OK) {


    let depositTx = await hyphen.depositManager.deposit({
      sender: `${currAccount}`,
      receiver: `${currAccount}`,
      tokenAddress: "0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa",
      depositContractAddress: "0xb831F0848A055b146a0b13D54cfFa6C1FE201b83",
      amount: bridgeValue,
      fromChainId: 80001, 
      toChainId: 5,
      useBiconomy: true, 
      tag: "Buildspace Eth Bridge"
    });

    await depositTx.wait(1);
  }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if(chainId === '0x5') {
      bridgeEthToMatic();
    } else if (chainId === '0x13881') {
      bridgeMaticToEth();
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    checkConnectedNetwork();
  }, [])

  useEffect(() => {
    window.process = {
      ...window.process,
    };
  }, []);

  useEffect(() => {
    if(window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })
    }

    if(window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      })
    }
  })

  return (
    <VStack p={4}>
      <HStack 
        alignSelf='flex-end'>
          {
            currAccount ? (
              <Tag
              size='lg'
              colorScheme='teal'>
                <Text 
                maxWidth='150px'
                isTruncated>
                  {
                    chainId in chainIDs ? chainIDs[chainId] : 'Wrong network'
                  }
                </Text>
              </Tag>
            ) : (
              null
            )
          }
          {
            currAccount ? (
              <Tag
              size='lg'
              colorScheme='orange'>
                <Text 
                maxWidth='150px'
                isTruncated>{currAccount}
                </Text>
              </Tag>
            ) : (
              <Button 
              colorScheme='orange' 
              px='8' 
              type='button'
              onClick={connectWallet}
              >
                Connect Wallet
              </Button>
            )
          }
        <IconButton
        icon={colorMode ==='light' ? <FaMoon /> : <FaSun />}
        isRound='true' 
        size='lg' 
        alignSelf='flex-end'
        onClick={toggleColorMode}/>
      </HStack>
      
      <Heading 
      mb='8'
      fontWeight='extrabold' 
      size='2xl' 
      bgGradient='linear(to-r, orange.500, orange.300, pink.500)'
      bgClip='text'
      >
        ETH-2-POLYGON BRIDGE
      </Heading>

      {
        (
          function(){
            if(currAccount && chainId === '0x5') {
              return(
                <Tag
                size='md'
                colorScheme='blue'>
                  <Text 
                  maxWidth='150px'
                  isTruncated>
                    {
                      'GOERLI to MUMBAI'
                    }
                  </Text>
                </Tag>
              )
            } else if (currAccount && chainId === '0x13881') {
              return (
                <Tag
                size='md'
                colorScheme='blue'>
                  <Text 
                  maxWidth='150px'
                  isTruncated>
                    {
                      'MUMBAI to GOERLI'
                    }
                  </Text>
                </Tag>
              )
            } else {
              return (
                <Tag
                size='md'
                colorScheme='red'>
                  <Text 
                  maxWidth='300px'
                  isTruncated>
                    {
                      'Please switch to Goerli/Mumbai'
                    }
                  </Text>
                </Tag>
              );
            }
          }
        )()
      }

      <form onSubmit={onSubmitHandler}>
          <HStack mt='8'>
              <Input 
              variant='filled' 
              placeholder='set in wei'
              value={bridgeValue} 
              onChange={(e) => setBridgeValue(e.target.value)}/>
              <Button colorScheme='pink' px='8' type='submit'>Bridge</Button>
          </HStack>
      </form>
    </VStack>
  );
}

export default App;
