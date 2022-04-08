import React, {useState} from 'react'
import Modal from "react-modal"
import styles from "./Core.module.css"
import {AppDispatch} from "../../app/store"
import {useSelector, useDispatch} from "react-redux"

import { File } from "../types"

import {
    editNickname,
    selectProfile,
    selectOpenProfile,
    resetOpenProfile,
    fetchCredStart,
    fetchCredEnd,
    fetchAsyncUpdateProf
}from "../auth/authSlice"

import { Button, TextField, IconButton} from '@material-ui/core'
import { MdAddAPhoto } from 'react-icons/md'

// modalのCSS
const customStyles = {
    // ボタンの色
    overlay: {
        backgroundColor: "#777777"
    },
    // modalの配置
    content: {
        top: "55%",
        left: "50%",

        width: 280,
        height: 350,
        padding: "50px",

        transform: "translate(-50%, -50%)"
    }
};


const EditProfile : React.FC = () => {
    const dispatch: AppDispatch = useDispatch()
    const openProfile = useSelector(selectOpenProfile)
    const profile = useSelector(selectProfile)
    // 初期値はnullに設定
    const [image, setImage] = useState<File | null>(null)

    const updateProfile = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        const packet = {id: profile.id, nickName: profile.nickName, img: image}

        await dispatch(fetchCredStart())
        await dispatch(fetchAsyncUpdateProf(packet))
        await dispatch(fetchCredEnd())
        await dispatch(resetOpenProfile())
    }

    const handleEditPicture = () => {
        const fileInput = document.getElementById("imageInput")
        fileInput?.click()
    }
    return (
        <>
            <Modal
                isOpen={openProfile}
                onRequestClose={async() => {
                    await dispatch(resetOpenProfile())
                }}
                style={customStyles}
            >
                <form className={styles.core_signUp}>
                    <h1 className={styles.core_title}>SNS clone</h1>
                    <br />
                    <TextField
                        placeholder="nickname" 
                        type="text"
                        value={profile?.nickName}
                        onChange={(e) => dispatch(editNickname(e.target.value))}
                    />

                    <input
                        type="file"
                        id="imageInput"
                        hidden={true}
                        onChange={(e) => setImage(e.target.files![0])}
                    />
                    <br />
                    <IconButton onClick={handleEditPicture}>
                        <MdAddAPhoto />
                    </IconButton>
                    <br />
                    <Button
                        disabled={!profile?.nickName}
                        variant="contained"
                        color="primary"
                        type="submit"
                        onClick={updateProfile}
                    >
                        Update
                    </Button>
                </form>
            </Modal>
        </>
    )
}

export default EditProfile
