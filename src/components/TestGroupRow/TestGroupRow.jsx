import React, { useState, useEffect, useRef } from "react";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import TextField from '@mui/material/TextField'
import CustomButton from '../CustomButton/CustomButton'
import GroupForm from '../GroupForm/GroupForm'
import Paper from '@mui/material/Paper'
import KdbQueryStatus from '../KdbQueryStatus/KdbQueryStatus'


const TestGroupRow = ({ environments, group_data, handleTestConnect, updateGroupEnv }) => {
    const detailsRef = useRef(null)
    const [groupName, setGroupName] = useState(group_data.DEV?.Name || "")
    const [groupData, setGroupData] = useState(JSON.parse(JSON.stringify(group_data)))
    const [nameChangeDisabled, setNameChangeDisabled] = useState(group_data.DEV?.Name ? true : false)
    
    const initialEditModePerEnv = Object.keys(group_data).reduce((acc, env) => {
        acc[env] = !group_data[env].Machine && !group_data[env].Port;
        return acc;
    }, {});
    const [editModePerEnv, setEditModePerEnv] = useState(initialEditModePerEnv)
    const [showDetails, setShowDetails] = useState(Object.values(initialEditModePerEnv).some(value => value));

    useEffect(() => {
        if (showDetails && detailsRef.current) {
            detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [showDetails])

    const handleUndo = (env) => {
        setEditModePerEnv(prevEditModePerEnv => ({ ...prevEditModePerEnv, [env]: false }))
        // setGroupData for that env to the original data
        console.log(group_data)
        console.log("env", env)
        setGroupData(prevGroupData => ({ ...prevGroupData, [env]: group_data[env] }))
    }

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

    const handleAddEnvironment = (env) => {
        setGroupData(prevGroupData => ({ ...prevGroupData, [env]: { Machine: "", Port: "", Scheduled: "", TLS: false } }))
        setEditModePerEnv(prevEditModePerEnv => ({ ...prevEditModePerEnv, [env]: true }))
    }

    const handleIconClick = () => {
        setShowDetails(prevShowDetails => !prevShowDetails);
    }
    
    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                {nameChangeDisabled ? (
                    <Paper
                        elevation={3}
                        style={{
                            padding: '16px',
                            fontFamily: 'Cascadia Code',
                            backgroundColor: 'white',
                            boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                            minWidth: '250px',
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            height: '56px', // Match the height of TextField
                            boxSizing: 'border-box' // Ensure padding is included in the height
                        }}
                    >
                        {groupName}
                    </Paper>
                ) : (
                    <TextField
                        label="Name"
                        variant="filled"
                        value={groupName}
                        onChange={groupNameChange}
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
                )}
                {showDetails ? (
                    <ArrowDropUpIcon 
                        onClick={handleIconClick} 
                        style={{ 
                            cursor: 'pointer',
                            fontSize: '30px',
                            color: '#555'
                        }}
                    />
                ) : (
                    <ArrowDropDownIcon 
                        onClick={handleIconClick} 
                        style={{ 
                            cursor: 'pointer',
                            fontSize: '30px',
                            color: '#555'
                        }}
                    />
                )}
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
                                editing={editModePerEnv[env]}
                                onUndo={() => handleUndo(env)}
                            />
                        ) : environments[env] ? (
                            <CustomButton 
                                key={env}
                                height={0.8} 
                                width={1.2} 
                                onClick={() => handleAddEnvironment(env)}
                            >
                            Add {env} Environment
                            </CustomButton>
                        ) : null
                    ))}
                </div>
            )}
        </>
    )
};

export default TestGroupRow;

/*<KdbQueryStatus
                queryStatus={connectionValid}
                loading={loading}
                message={connectionValid ? "Connection Successful" : "Connection Failed => " + connectMessage}
            />*/
