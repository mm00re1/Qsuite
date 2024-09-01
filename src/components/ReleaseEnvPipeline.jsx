import React from 'react'
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'
import CustomButton from '../components/CustomButton/CustomButton'
import ReleaseBox from '../components/ReleaseBox'
import Header from '../components/Header/Header'
import { useNavigate } from 'react-router-dom'

const ReleaseEnvPipeline = ({handleRelease, environmentTarget, env, environments, releaseEnabled}) => {
  const navigate = useNavigate();

  const goToHomePage = () => {
    navigate('/');
  }

  return (
    <>
      <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'}}>
        {['DEV', 'TEST', 'PROD'].map((environment, index) => (
          <React.Fragment key={environment}>
            {environmentTarget === environment && (
                <CustomButton 
                  height={0.7} 
                  width={0.6} 
                  onClick={handleRelease}
                  disabled={!releaseEnabled}
                >
                  Release
                </CustomButton>
            )}
            {environments[environment] && (
                <ReleaseBox
                  environment={environment}
                  isDone={environment === env}
                />
            )}
            {index < Object.keys(environments).length - 1 && (
              <KeyboardDoubleArrowDownIcon 
                style={{ color: environment === env ? '#00FF00' : 'inherit' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

export default ReleaseEnvPipeline;
