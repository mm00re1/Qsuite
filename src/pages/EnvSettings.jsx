import React, { useState } from 'react'
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown'
import EnvironmentRow from '../components/EnvironmentRow/EnvironmentRow'
import CustomButton from '../components/CustomButton/CustomButton'
import Header from '../components/Header/Header'
import { useNavigation } from '../TestNavigationContext'
import ConfirmationPopup from '../components/ConfirmationPopup/ConfirmationPopup'
import NotificationPopup from '../components/NotificationPopup/NotificationPopup'
import { loadEnvironmentsFromLocalStorage, saveEnvironmentsToLocalStorage } from '../utils/api'
import { useApi } from '../api/ApiContext'

const EnvSettings = () => {
  const { env, setEnv, environments, setEnvironments } = useNavigation()
  const [envCredentials, setEnvCredentials] = useState({})
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [environmentToDelete, setEnvironmentToDelete] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)
  const [notificationSuccess, setNotificationSuccess] = useState(true)
  const { fetchData } = useApi()


  const connectionOptions = ["User/Password", "Azure Oauth"]

  const fetchAndSetEnvironments = async (fetchData, setEnvironments, setEnv, env) => {
    try {
      const envs = loadEnvironmentsFromLocalStorage();
      const formattedEnvironments = Object.entries(envs).reduce((acc, [key, value]) => {
        acc[key] = { url: value.url, isEditing: false, isSaved: true };
        return acc;
      }, {});

      const updatedEnvironments = await Promise.all(
        Object.entries(formattedEnvironments).map(async ([key, env]) => {
          const conn_method = await fetchData(`${env.url}/get_connect_method/`, {}, "get_connect_method")
          // Process credentials as needed
          return [key, { ...env, conn_method }]
        })
      )

      // Convert back to an object and update the environments state
      const updatedEnvObject = Object.fromEntries(updatedEnvironments)

      const unsavedEnvironments = Object.entries(environments).reduce((acc, [key, value]) => {
        // Only include unsaved environments that are not already in updatedEnvObject
        if (!value.isSaved && !updatedEnvObject.hasOwnProperty(key)) {
          acc[key] = value
        }
        return acc
      }, {})
  
      const mergedEnvironments = { ...updatedEnvObject, ...unsavedEnvironments }
      setEnvironments(mergedEnvironments)
  
      const envOrder = ['DEV', 'TEST', 'PROD']
      const orderedEnvs = envOrder.filter(e => updatedEnvObject.hasOwnProperty(e))
  
      if (!orderedEnvs.includes(env)) {
        const newEnv = orderedEnvs.length > 0 ? orderedEnvs[0] : ""
        setEnv(newEnv)
      }
    } catch (error) {
      console.error('Error fetching and setting environments:', error)
    }
  }

  const showPopupWithMessage = (message, success) => {
    setNotification(message)
    setNotificationSuccess(success)
  }

  const handleActivate = (environment) => {
    setEnv(environment)
  }

  const handleEdit = async (environment) => {
    setEnvironments((prevEnvironments) => ({
      ...prevEnvironments,
      [environment]: { ...prevEnvironments[environment], isEditing: true }
    }));
    setLoading(true)
    try {
      const data = await fetchData(`${environments[environment].url}/get_credentials/`, {}, 'get_credentials')
      setEnvCredentials((prevCredentials) => ({
        ...prevCredentials,
        [environment]: data // Set or update the specific environment key with the API result
      }))
    } catch (error) {
      console.error('Error fetching kdb credentials:', error)
    }
    setLoading(false)
  }

  const handleDelete = (environment) => {
    setEnvironmentToDelete(environment);
    setShowConfirmation(true);
  }

  const confirmDelete = async () => {
    try {
      const envData = environments[environmentToDelete]
      if (envData?.isSaved) {
        const newEnvironments = { ...environments };
        delete newEnvironments[envName];
        saveEnvironmentsToLocalStorage(newEnvironments);

        // Refresh environments after deletion
        await fetchAndSetEnvironments(fetchData, setEnvironments, setEnv, env);
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
    setSaving(true)
    showPopupWithMessage("this will not display, it just to show the loading icon", true)
    try {
      const updatedEnvironments = { ...environments };
      updatedEnvironments[environment] = { url: newUrl };
      saveEnvironmentsToLocalStorage(updatedEnvironments);

      await fetchData(
        `${newUrl}/store_credentials/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...envCredentials[environment],
            'method': environments[environment].conn_method
          }),
        },
        'store_credentials'
      );
      fetchAndSetEnvironments(fetchData, setEnvironments, setEnv, env)
      showPopupWithMessage("Connected successfully to backend", true)
      setEnvCredentials((prevCredentials) => ({
        ...prevCredentials,
        [environment]: {}
      }))

    } catch (error) {
        console.error('Error adding the backend connection:', error)
        showPopupWithMessage("Error adding the backend connection", false)
    }
    setSaving(false)
  }

  const handleCredentialChange = (environment, credKey, credValue) => {
    setEnvCredentials((prevCredentials) => ({
      ...prevCredentials,
      [environment]: { ...prevCredentials[environment], [credKey]: credValue }
    }))
  }

  const handleConnMethodChange = (environment, newConnMethod) => {
    setEnvironments((prevEnvironments) => ({
      ...prevEnvironments,
      [environment]: { ...prevEnvironments[environment], conn_method: newConnMethod }
    }))
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
                connMethod={environments[environment].conn_method}
                connectionOptions={connectionOptions} // should this be moved to Environment Row?
                isEditing={environments[environment].isEditing}
                onEdit={() => handleEdit(environment)}
                onSave={(newUrl) => handleSave(environment, newUrl)}
                onDelete={() => handleDelete(environment)}
                onActivate={() => handleActivate(environment)}
                isActive={env === environment}
                envCredentials={envCredentials[environment]}
                onCredentialChange={(credKey, credValue) => handleCredentialChange(environment,credKey, credValue)}
                onConnMethodChange={(newConnMethod) => handleConnMethodChange(environment, newConnMethod)}
                loading={loading}
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
      {notification && (
        <NotificationPopup
            message={notification}
            status={notificationSuccess}
            onClose={() => setNotification(null)}
            loading={saving}
        />
      )}
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
