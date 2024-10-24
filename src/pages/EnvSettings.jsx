import React, { useState } from 'react'
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'
import EnvironmentRow from '../components/EnvironmentRow/EnvironmentRow'
import CustomButton from '../components/CustomButton/CustomButton'
import Header from '../components/Header/Header'
import { useNavigation } from '../TestNavigationContext'
import ConfirmationPopup from '../components/ConfirmationPopup/ConfirmationPopup'
import { useError } from '../ErrorContext.jsx'
import { useAuthenticatedApi } from "../hooks/useAuthenticatedApi"


const EnvSettings = () => {
  const { env, setEnv, environments, setEnvironments } = useNavigation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [environmentToDelete, setEnvironmentToDelete] = useState(null);
  const { showError } = useError()
  const { fetchWithAuth } = useAuthenticatedApi(showError)


  const fetchAndSetEnvironments = async (fetchWithAuth, setEnvironments, setEnv, env) => {
    try {
      const data = await fetchWithAuth("/api/get_agent_urls/", {}, "get_agent_urls");
  
      const formattedEnvironments = Object.entries(data).reduce((acc, [key, value]) => {
        acc[key] = { url: value, isEditing: false, isSaved: true };
        return acc;
      }, {});

      const unsavedEnvironments = Object.entries(environments).reduce((acc, [key, value]) => {
        // Only include unsaved environments that are not already in formattedEnvironments
        if (!value.isSaved && !formattedEnvironments.hasOwnProperty(key)) {
          acc[key] = value
        }
        return acc
      }, {})
  
      const mergedEnvironments = { ...formattedEnvironments, ...unsavedEnvironments }
      setEnvironments(mergedEnvironments)
  
      const envOrder = ['DEV', 'TEST', 'PROD']
      const orderedEnvs = envOrder.filter(e => formattedEnvironments.hasOwnProperty(e))
  
      if (!orderedEnvs.includes(env)) {
        const newEnv = orderedEnvs.length > 0 ? orderedEnvs[0] : ""
        setEnv(newEnv)
      }
    } catch (error) {
      console.error('Error fetching and setting environments:', error)
    }
  }

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

  const confirmDelete = async () => {
    try {
      const envData = environments[environmentToDelete]
      if (envData?.isSaved) {
        // Environment exists in the backend, delete it via API
        await fetchWithAuth(
          "/api/delete_env_url/",
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ environment: environmentToDelete }),
          },
          'delete_env_url'
        );

        // Refresh environments after deletion
        await fetchAndSetEnvironments(fetchWithAuth, setEnvironments, setEnv, env);
      } else {
        // Environment is only in local state, remove it directly
        setEnvironments((prevEnvironments) => {
          const newEnvironments = { ...prevEnvironments };
          delete newEnvironments[environmentToDelete];
          return newEnvironments;
        });
      }
      
      // Reset the state for environment deletion and hide confirmation dialog
      setShowConfirmation(false);
      setEnvironmentToDelete(null);
    } catch (error) {
      console.error('Error deleting environment:', error);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setEnvironmentToDelete(null);
  }

  const handleSave = async (environment, newUrl) => {
    try {
      await fetchWithAuth(
        '/api/add_env_url/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ environment, url: newUrl }),
        },
        'add_env_url'
      );

      fetchAndSetEnvironments(fetchWithAuth, setEnvironments, setEnv, env)

    } catch (error) {
        console.error('Error fetching agent urls:', error)
    }
  }

  const handleAddEnvironment = (environment) => {
    setEnvironments((prevEnvironments) => ({
      ...prevEnvironments,
      [environment]: { url: '', isEditing: true, isSaved: false }
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
