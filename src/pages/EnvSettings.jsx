import React, { useState } from 'react'
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'
import EnvironmentRow from '../components/EnvironmentRow/EnvironmentRow'
import CustomButton from '../components/CustomButton/CustomButton'
import Header from '../components/Header/Header'
import { useNavigate } from 'react-router-dom'
import { useNavigation } from '../TestNavigationContext'
import ConfirmationPopup from '../components/ConfirmationPopup/ConfirmationPopup'


const EnvSettings = () => {
    // go to wordpress database for this info in future
  const { env, setEnv, environments, setEnvironments } = useNavigation();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [environmentToDelete, setEnvironmentToDelete] = useState(null);


  const handleActivate = (environment) => {
    setEnv(environment)
  }

  const handleEdit = (environment) => {
    setEnvironments((prevEnvironments) => ({
      ...prevEnvironments,
      [environment]: { ...prevEnvironments[environment], isEditing: true }
    }));
  }

  const handleDelete = (environment) => {
    setEnvironmentToDelete(environment);
    setShowConfirmation(true);
  }

  const confirmDelete = () => {
    setEnvironments((prevEnvironments) => {
      const newEnvironments = { ...prevEnvironments };
      delete newEnvironments[environmentToDelete];
      return newEnvironments;
    });
    setShowConfirmation(false);
    setEnvironmentToDelete(null);
  }

  const cancelDelete = () => {
    setShowConfirmation(false);
    setEnvironmentToDelete(null);
  }

  const handleSave = (environment, newUrl) => {
    setEnvironments((prevEnvironments) => ({
      ...prevEnvironments,
      [environment]: { ...prevEnvironments[environment], url: newUrl, isEditing: false }
    }));
  }

  const handleAddEnvironment = (environment) => {
    setEnvironments((prevEnvironments) => ({
      ...prevEnvironments,
      [environment]: { url: '', isEditing: true }
    }));
  }

  return (
    <>
      <Header/>
      <div style={{ marginTop: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'}}>
        {['DEV', 'TEST', 'PROD'].map((environment, index) => (
          <React.Fragment key={environment}>
            {environments[environment] ? (
              <EnvironmentRow
                environment={environment}
                url={environments[environment].url}
                isEditing={environments[environment].isEditing}
                onEdit={() => handleEdit(environment)}
                onSave={(newUrl) => handleSave(environment, newUrl)}
                onDelete={() => handleDelete(environment)}
                onActivate={() => handleActivate(environment)}
                isActive={env === environment}
              />
            ) : (
                <CustomButton 
                  height={0.8} 
                  width={1.2} 
                  onClick={() => handleAddEnvironment(environment)}
                >
                  Add {environment} Environment
                </CustomButton>
            )}
            {index < 2 && (
                <KeyboardDoubleArrowDownIcon />
            )}
          </React.Fragment>
        ))}
      </div>
      {showConfirmation && (
        <ConfirmationPopup
          message={`Are you sure you want to delete the ${environmentToDelete} environment?
                    \nNote that this will not affect your backend agent`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
}

export default EnvSettings;
