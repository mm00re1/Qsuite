import React, { useState, useEffect, useRef } from "react";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import CustomButton from '../CustomButton/CustomButton'
import GroupForm from '../GroupForm/GroupForm'
import Paper from '@mui/material/Paper'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import Tooltip from '@mui/material/Tooltip'

const TestGroupRow = ({
    environments,
    group_data,
    handleTestConnect,
    updateGroupEnv,
    goToTestGroupDetails,
    handleDeleteClick,
    handleRunClick
    }) => {
    const detailsRef = useRef(null)
    const [groupName, setGroupName] = useState(group_data && group_data.DEV ? group_data.DEV.Name : "" || "")
    const [groupData, setGroupData] = useState(() => {
        try {
            return group_data ? JSON.parse(JSON.stringify(group_data)) : {};
        } catch (error) {
            console.error("Error parsing group_data:", error);
            return {};
        }
    })
    // set edit mode per env to false
    const [editModePerEnv, setEditModePerEnv] = useState(() => {
        if (group_data && typeof group_data === 'object') {
            return Object.keys(group_data).reduce((acc, env) => {
                acc[env] = false;
                return acc;
            }, {});
        }
        return {};
    })
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => {
        if (showDetails && detailsRef.current) {
            detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [showDetails])

    const updateGroupData = (env) => {
        // set editModePerEnv for that env to false
        setEditModePerEnv(prevEditModePerEnv => ({ ...prevEditModePerEnv, [env]: false }))
        updateGroupEnv(env,groupData[env], groupName)
    }

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
                <Paper
                    elevation={3}
                    style={{
                        padding: '16px',
                        fontFamily: 'Cascadia Code',
                        backgroundColor: 'white',
                        boxShadow: '0px 12px 18px rgba(0, 0, 0, 0.1)',
                        minWidth: '250px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: '56px', // Match the height of TextField
                        boxSizing: 'border-box' // Ensure padding is included in the height
                    }}
                >
                    <span 
                        onClick={goToTestGroupDetails}
                        style={{
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        }}
                    >
                        {groupName}
                    </span>
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
                </Paper>
                {showDetails ? (
                    <CustomButton height={0.7} width={0.5} onClick={handleDeleteClick}>
                        Delete
                    </CustomButton>
                ) : (
                    <Tooltip title="Release Tests" arrow>
                        <RocketLaunchIcon 
                            onClick={handleRunClick} 
                            style={{ 
                                cursor: 'pointer',
                                fontSize: '26px',
                                color: '#25ACF8'
                            }}
                        />
                    </Tooltip>
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
                                updateGroupEnv={() => updateGroupData(env)}
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
