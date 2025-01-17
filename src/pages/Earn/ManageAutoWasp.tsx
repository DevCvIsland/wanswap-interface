import React, { useCallback, useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'

import { ETHER, ChainId } from '@wanswap/sdk'
import { RouteComponentProps } from 'react-router-dom'
import CurrencyLogo from '../../components/CurrencyLogo'
import { useCurrency } from '../../hooks/Tokens'
import { useWalletModalToggle } from '../../state/application/hooks'
import { TYPE } from '../../theme'

import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/earnHive/styled'
import { ButtonPrimary } from '../../components/Button'
import StakingAutoWaspModal from '../../components/earnHive/StakingAutoWaspModal'
import { useStakeWaspEarnWaspInfo } from '../../state/hive/hooks'
import UnstakingAutoWaspModal from '../../components/earnHive/UnstakingAutoWaspModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useColor } from '../../hooks/useColor'

import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { useTranslation } from 'react-i18next'

import { WASP } from '../../constants'
import BN from 'bignumber.js'


const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const PositionInfo = styled(AutoColumn) <{ dim: any }>`
  position: relative;
  max-width: 640px;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`

const BottomSection = styled(AutoColumn)`
  border-radius: 10px;
  width: 100%;
  position: relative;
`

const StyledDataCard = styled(DataCard) <{ bgColor?: any; showBackground?: any }>`
  background: #3d51a5;
  z-index: 2;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);

`

const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  grid-gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    grid-gap: 12px;
  `};
`

export default function ManageAutoWasp({
  match: {
    params: { currencyIdA }
  }
}: RouteComponentProps<{ currencyIdA: string }>) {
  const { account, chainId } = useActiveWeb3React()
  const uni = WASP[chainId ? chainId : ChainId.MAINNET]

  // get currencies and pair
  const [currencyA, currencyB] = [useCurrency(currencyIdA), useCurrency(currencyIdA)]
  const tokenA = wrappedCurrency(currencyA ?? undefined, chainId)
  const tokenB = wrappedCurrency(currencyB ?? undefined, chainId)

  const stakingInfo = useStakeWaspEarnWaspInfo()
  // console.log('stakingInfo-amount', stakingInfo?.stakedAmount?.toSignificant(6))

  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, uni)
  const showAddLiquidityButton = false

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)

  // fade cards if nothing staked or nothing earned yet
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo('0')

  const token = currencyA === ETHER ? tokenB : tokenA
  const backgroundColor = useColor(token)

  const toggleWalletModal = useWalletModalToggle()

  const handleDepositClick = useCallback(() => {
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])

  const { t } = useTranslation()

  return (
    <PageWrapper gap="lg" justify="center">
      <RowBetween style={{ gap: '24px' }}>
        <TYPE.mediumHeader style={{ margin: 0 }}>
          {t("Auto")} {currencyA?.symbol}
        </TYPE.mediumHeader>
        <CurrencyLogo currency={currencyA ?? undefined} size={'40px'} />
      </RowBetween>

      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>{t("Total deposits")}</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {`${stakingInfo?.totalStakedAmount.toFixed(6) ? stakingInfo?.totalStakedAmount.toFixed(0, BN.ROUND_UP) : '-'} WASP`}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
      </DataRow>
      {stakingInfo && (
        <>
          <StakingAutoWaspModal
            isOpen={showStakingModal}
            onDismiss={() => setShowStakingModal(false)}
            stakingInfo={stakingInfo}
            userLiquidityUnstaked={userLiquidityUnstaked}
          />
          <UnstakingAutoWaspModal
            isOpen={showUnstakingModal}
            onDismiss={() => setShowUnstakingModal(false)}
            stakingInfo={stakingInfo}
          />
        </>
      )}

      <PositionInfo gap="lg" justify="center" dim={showAddLiquidityButton}>
        <BottomSection gap="lg" justify="center">
          <StyledDataCard disabled={disableTop} bgColor={backgroundColor} showBackground={!showAddLiquidityButton}>
            <CardSection>
              <CardBGImage desaturate />
              <CardNoise />
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>{t("Your WASP deposits")}</TYPE.white>
                </RowBetween>
                <RowBetween style={{ alignItems: 'center', display:'flex',flexWrap:'wrap' }}>
                  <TYPE.white fontSize={36} fontWeight={600}>
                    {stakingInfo?.stakedAmount?.toSignificant(6) ? new BN(stakingInfo?.stakedAmount?.toExact()).toFixed(6, BN.ROUND_UP) : '-'}
                  </TYPE.white>
                  <TYPE.white>
                    {currencyA?.symbol}
                  </TYPE.white>
                </RowBetween>
              </AutoColumn>
            </CardSection>
          </StyledDataCard>
        </BottomSection>
        <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ⭐️
          </span>
          {t("You will earn compound interest on your initial deposits of WASP.")}
        </TYPE.main>

        {!showAddLiquidityButton && (
          <DataRow style={{ marginBottom: '1rem',gap:0 }}>
            <ButtonPrimary padding="8px" borderRadius="8px" width="260px"  margin="6px" onClick={handleDepositClick}>
              {stakingInfo?.stakedAmount?.greaterThan('0') ? t('Deposit') : t('Deposit WASP Tokens')}
            </ButtonPrimary>

            {stakingInfo?.stakedAmount?.greaterThan('0') && (
              <>
                <ButtonPrimary
                  margin="6px"
                  padding="8px"
                  borderRadius="8px"
                  width="260px"
                  onClick={() => setShowUnstakingModal(true)}
                >
                  {t("Withdraw")}
                </ButtonPrimary>
              </>
            )}
          </DataRow>
        )}
      </PositionInfo>
    </PageWrapper>
  )
}
