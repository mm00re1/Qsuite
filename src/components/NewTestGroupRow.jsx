import React, { useState, useEffect, useRef } from "react";
import TextField from '@mui/material/TextField'
import CustomButton from './CustomButton/CustomButton'
import GroupForm from './GroupForm/GroupForm'
import CloseIcon from '@mui/icons-material/Close'


const NewTestGroupRow = ({ environments, group_data, handleTestConnect, updateGroupEnv, removeNewGroup, showPopupWithMessage }) => {
    const detailsRef = useRef(null)
    const [groupName, setGroupName] = useState(group_data.DEV?.Name || "")
    const [groupData, setGroupData] = useState(JSON.parse(JSON.stringify(group_data)))
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => {
        if (showDetails && detailsRef.current) {
            detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [showDetails])

    const handleEditClick = (env) => {
        setEditModePerEnv(prevEditModePerEnv => ({ ...prevEditModePerEnv, [env]: true }))
    }

    const groupNameChange = (event) => {
        setGroupName(event.target.value)
    }

    const handleInputChange = (env, field, value) => {
        const newGroupData = { ...groupData }
        newGroupData[env][field] = value
        setGroupData(newGroupData)
    }

    const handleNextClick = () => {
        // if groupName is empty, show error
        if (groupName === "") {
            showPopupWithMessage("Group name cannot be empty", false)
            return
        }
        setShowDetails(true);
    }

    const onClose = () => {
        removeNewGroup()
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleNextClick();
        }
    }

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                <TextField
                    label="Name"
                    variant="filled"
                    value={groupName}
                    onChange={groupNameChange}
                    onKeyPress={handleKeyPress}
                    style={{
                        boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                        minWidth: '250px'
                    }}
                    InputLabelProps={{
                        style: {
                            fontFamily: 'Cascadia Code',
                        }
                    }}
                    InputProps={{
                        style: {
                            backgroundColor: 'white',
                            fontFamily: 'Cascadia Code',
                        }
                    }}
                />
                {!showDetails && (
                    <CustomButton height={0.7}  width={0.5}  onClick={handleNextClick}>
                        Next
                    </CustomButton>
                )}
                <CloseIcon
                        onClick={onClose}
                        style={{ cursor: 'pointer', width: '24px', height: '24px' }}
                    />
            </div>
            {showDetails && (
                <div style={{marginBottom: '20px'}} ref={detailsRef}>
                    {['DEV', 'TEST', 'PROD'].map((env) => (
                        environments[env] && groupData[env] ? (
                            <GroupForm
                                key={env}
                                env={env}
                                machine={groupData[env].Machine}
                                port={groupData[env].Port}
                                schedule={groupData[env].Scheduled}
                                tls={groupData[env].TLS}
                                onChange={(field, value) => handleInputChange(env, field, value)}
                                onEdit={() => handleEditClick(env)}
                                onTestConnect={() => handleTestConnect(env,groupData[env])}
                                updateGroupEnv={() => updateGroupEnv(env,groupData[env], groupName)}
                                editing={true}
                                editButton={false}
                            />
                        ) : null
                    ))}
                </div>
            )}
        </>
    )
};

export default NewTestGroupRow;