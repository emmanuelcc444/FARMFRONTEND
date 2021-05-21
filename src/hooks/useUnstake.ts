import { useCallback } from 'react'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import { useDispatch } from 'react-redux'
import {
  fetchFarmUserDataAsync,
  updateUserStakedBalance,
  updateUserBalance,
  updateUserPendingReward,
} from 'state/actions'
import { unstake, sousUnstake, sousEmegencyUnstake } from 'utils/callHelpers'
import { useMasterchef, useSousChef } from './useContract'

let decimals
const useUnstake = (pid: number) => {
  decimals = 18
  if(pid === 5)
    decimals = 9
  
  console.log(pid)
  console.log(decimals)
  const dispatch = useDispatch()
  const { account } = useWallet()
  const masterChefContract = useMasterchef()

  const handleUnstake = useCallback(
    async (amount: string) => {
      const txHash = await unstake(masterChefContract, pid, amount, account, decimals)
      dispatch(fetchFarmUserDataAsync(account))
      console.info(txHash)
    },
    [account, dispatch, masterChefContract, pid],
  )

  return { onUnstake: handleUnstake }
}

const SYRUPIDS = [5, 6, 3, 1, 22, 23]

export const useSousUnstake = (sousId, dec) => {
  decimals = dec
  const dispatch = useDispatch()
  const { account } = useWallet()
  const masterChefContract = useMasterchef()
  const sousChefContract = useSousChef(sousId)
  const isOldSyrup = SYRUPIDS.includes(sousId)

  const handleUnstake = useCallback(
    async (amount: string) => {
      if (sousId === 0) {
        const txHash = await unstake(masterChefContract, 0, amount, account, decimals)
        console.info(txHash)
      } else if (isOldSyrup) {
        const txHash = await sousEmegencyUnstake(sousChefContract, amount, account)
        console.info(txHash)
      } else {
        const txHash = await sousUnstake(sousChefContract, amount, account, decimals)
        console.info(txHash)
      }
      dispatch(updateUserStakedBalance(sousId, account))
      dispatch(updateUserBalance(sousId, account))
      dispatch(updateUserPendingReward(sousId, account))
    },
    [account, dispatch, isOldSyrup, masterChefContract, sousChefContract, sousId],
  )
  decimals = 18  
  return { onUnstake: handleUnstake }
}

export default useUnstake
