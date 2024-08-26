import React, { useState } from 'react'
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'
import EnvironmentRow from '../components/EnvironmentRow/EnvironmentRow'
import CustomButton from '../components/CustomButton/CustomButton'
import Header from '../components/Header/Header'
import { useNavigate } from 'react-router-dom'
import { useNavigation } from '../TestNavigationContext'; // Adjust the path as necessary
import ConfirmationPopup from '../components/ConfirmationPopup/ConfirmationPopup' // Assuming this component exists


const EnvSettings = () => {
    // go to wordpress database for this info in future
  const { environments, setEnvironments } = useNavigation();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [environmentToDelete, setEnvironmentToDelete] = useState(null);


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

  const handleAddEnvironment = (env) => {
    setEnvironments((prevEnvironments) => ({
      ...prevEnvironments,
      [env]: { url: '', isEditing: true }
    }));
  }

  const goToHomePage = () => {
    navigate('/');
  }

  return (
    <>
      <Header title={"Home Page"} onClick={goToHomePage} />
      <div style={{ marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'}}>
        {['DEV', 'TEST', 'PROD'].map((env, index) => (
          <React.Fragment key={env}>
            {environments[env] ? (
              <EnvironmentRow
                environment={env}
                url={environments[env].url}
                isEditing={environments[env].isEditing}
                onEdit={() => handleEdit(env)}
                onSave={(newUrl) => handleSave(env, newUrl)}
                onDelete={() => handleDelete(env)}
              />
            ) : (
                <CustomButton 
                  height={0.8} 
                  width={1.2} 
                  onClick={() => handleAddEnvironment(env)}
                >
                  Add {env} Environment
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
