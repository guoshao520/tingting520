import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaUser,
  FaCalendar,
  FaVenus,
  FaMars,
  FaEdit,
  FaCheck,
  FaTimes,
  FaArrowLeft,
} from 'react-icons/fa'
import './ProfileEditPage.less'
import TopNavBar from '@/components/TopNavBar'
import { toastMsg } from '@/utils/toast'
import userApi from '@/api/user'
import { getLoginInfo } from '@/utils/storage'
import { Dialog } from 'antd-mobile';

const genderOptions = [
  { label: '男', value: 1, icon: <FaMars /> },
  { label: '女', value: 2, icon: <FaVenus /> },
]

const ProfileEditPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [profile, setProfile] = useState({
    id: '',
    avatar: 'https://via.placeholder.com/100',
    nickname: '',
    sex: 1,
    age: 0,
    birthday: '',
  })
  const [editingField, setEditingField] = useState(null)
  const [tempValue, setTempValue] = useState('')
  const dateInputRef = useRef(null)

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const loginInfo = getLoginInfo()
        if (loginInfo?.id) setProfile((prev) => ({ ...prev, id: loginInfo.id }))

        const res = await userApi.detail()
        if (res?.code === 200 && res.data) {
          const userData = res.data
          setProfile((prev) => ({
            ...prev,
            avatar: userData.avatar || 'https://via.placeholder.com/100',
            nickname: userData.nickname || '未设置昵称',
            sex: userData.sex || 1,
            age: userData.age || 0,
            birthday: userData.birthday || '',
          }))
        } else {
          toastMsg('加载用户信息失败', 'error')
        }
      } catch (error) {
        console.error('获取用户详情错误:', error)
        toastMsg('网络错误，无法加载用户信息', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetail()
  }, [navigate])

  const handleBack = () => {
    if (editingField) {
      Dialog.confirm({
        content: '当前有未保存的修改，是否放弃？',
        onConfirm: async () => {
          navigate('/profile')
        },
      })
    } else {
      navigate('/profile')
    }
  }

  const handleSave = async () => {
    if (!profile.nickname.trim()) {
      toastMsg('请填写昵称', 'warning')
      return
    }
    if (profile.age < 0 || profile.age > 150) {
      toastMsg('请设置合理的年龄（0-150）', 'warning')
      return
    }

    const updateData = {
      nickname: profile.nickname,
      sex: profile.sex,
      age: profile.age,
      avatar: profile.avatar,
      birthday: profile.birthday,
    }

    try {
      setSubmitLoading(true)
      const res = await userApi.update(updateData)
      if (res?.code === 200) {
        toastMsg('个人信息保存成功')
        navigate('/profile')
      } else {
        toastMsg(res?.message || '保存失败，请重试', 'error')
      }
    } catch (error) {
      console.error('更新用户信息错误:', error)
      toastMsg('网络错误，保存失败', 'error')
    } finally {
      setSubmitLoading(false)
    }
  }

  const startEditing = (field) => {
    setEditingField(field)
    switch (field) {
      case 'nickname':
        setTempValue(profile.nickname)
        break
      case 'age':
        setTempValue(profile.age.toString())
        break
      case 'sex':
        setTempValue(profile.sex)
        break
      case 'birthday':
        setTempValue(profile.birthday)
        setTimeout(() => {
          dateInputRef.current?.focus()
        }, 100)
        break
    }
  }

  const cancelEditing = () => {
    setEditingField(null)
    setTempValue('')
  }

  const confirmEditing = () => {
    if (!tempValue && editingField !== 'age' && editingField !== 'sex') return

    let updatedValue = tempValue
    switch (editingField) {
      case 'age':
        updatedValue = parseInt(tempValue) || 0
        if (updatedValue < 0 || updatedValue > 150) {
          toastMsg('请输入合理的年龄（0-150）', 'warning')
          return
        }
        break
      case 'sex':
        updatedValue = tempValue
        break
      case 'birthday':
        const dateReg = /^\d{4}-\d{2}-\d{2}$/
        if (!dateReg.test(tempValue) && tempValue) {
          toastMsg('请选择正确的日期', 'warning')
          return
        }
        break
    }

    setProfile({
      ...profile,
      [editingField]: updatedValue,
    })
    cancelEditing()
  }

  const handleAvatarChange = async () => {
    try {
      const randomId = Math.floor(Math.random() * 1000)
      const newAvatarUrl = `https://via.placeholder.com/100?random=${randomId}`
      setProfile({
        ...profile,
        avatar: newAvatarUrl,
      })
      toastMsg('头像更换成功')
    } catch (error) {
      console.error('更换头像错误:', error)
      toastMsg('头像更换失败，请重试', 'error')
    }
  }

  const renderEditBox = () => {
    switch (editingField) {
      case 'nickname':
        return (
          <div className="edit-box">
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              maxLength={10}
              placeholder="请输入昵称（最多10字）"
              autoFocus
              className="edit-input"
            />
            <div className="edit-buttons">
              <button onClick={cancelEditing} className="edit-btn cancel-btn">
                <FaTimes size={16} />
              </button>
              <button onClick={confirmEditing} className="edit-btn confirm-btn">
                <FaCheck size={16} />
              </button>
            </div>
          </div>
        )
      case 'age':
        return (
          <div className="edit-box">
            <input
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value.replace(/\D/g, ''))}
              min="0"
              max="150"
              placeholder="请输入年龄"
              autoFocus
              className="edit-input"
            />
            <div className="edit-buttons">
              <button onClick={cancelEditing} className="edit-btn cancel-btn">
                <FaTimes size={16} />
              </button>
              <button onClick={confirmEditing} className="edit-btn confirm-btn">
                <FaCheck size={16} />
              </button>
            </div>
          </div>
        )
      case 'sex':
        return (
          <div className="edit-box gender-edit-box">
            <div className="gender-options">
              {genderOptions.map((option) => (
                <div
                  key={option.value}
                  className={`gender-option ${
                    tempValue === option.value ? 'active' : ''
                  }`}
                  onClick={() => setTempValue(option.value)}
                >
                  <span className="gender-icon">{option.icon}</span>
                  <span className="gender-label">{option.label}</span>
                </div>
              ))}
            </div>
            <div className="edit-buttons">
              <button onClick={cancelEditing} className="edit-btn cancel-btn">
                <FaTimes size={16} />
              </button>
              <button onClick={confirmEditing} className="edit-btn confirm-btn">
                <FaCheck size={16} />
              </button>
            </div>
          </div>
        )
      case 'birthday':
        return (
          <div className="edit-box">
            <input
              type="date"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              ref={dateInputRef}
              className="edit-input date-input"
            />
            <div className="edit-buttons">
              <button onClick={cancelEditing} className="edit-btn cancel-btn">
                <FaTimes size={16} />
              </button>
              <button onClick={confirmEditing} className="edit-btn confirm-btn">
                <FaCheck size={16} />
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="profile-edit-container">
      <TopNavBar
        title={'编辑个人信息'}
        onBack={handleBack}
        rightContent={
          <button
            className="save-button"
            onClick={handleSave}
            disabled={submitLoading || editingField}
          >
            {submitLoading ? '保存中...' : '保存'}
          </button>
        }
      />

      <div className="profile-edit-content">
        <div className="avatar-edit-section">
          <div className="avatar-container">
            <img src={profile.avatar} className="avatar-img" />
            {/* <div className="avatar-edit-mask">
              <FaEdit size={20} />
              <span className="avatar-edit-text">更换头像</span>
            </div> */}
          </div>
        </div>

        <div className="profile-form">
          {[
            {
              icon: <FaUser />,
              label: '姓名',
              value: profile.nickname,
              type: 'nickname',
              hint: '最多10个字符',
            },
            {
              icon: genderOptions.find((g) => g.value === profile.sex)?.icon,
              label: '性别',
              value: genderOptions.find((g) => g.value === profile.sex)?.label,
              type: 'sex',
              hint: '',
            },
            {
              icon: <FaUser />,
              label: '年龄',
              value: profile.age > 0 ? `${profile.age}岁` : '未设置',
              type: 'age',
              hint: '0-150之间',
            },
            {
              icon: <FaCalendar />,
              label: '生日',
              value: profile.birthday || '未设置',
              type: 'birthday',
              hint: '选择出生日期',
            },
          ].map((item, index) => (
            <div key={index} className="form-item">
              {editingField !== item.type && (
                <>
                  <div className="form-item-left">
                    <span className="form-icon">{item.icon}</span>
                    <span className="form-label">{item.label}</span>
                  </div>
                  <div className="form-item-right">
                    <span className="form-value">{item.value}</span>
                    {item.hint && (
                      <span className="form-hint">{item.hint}</span>
                    )}
                    <button
                      className="form-edit-btn"
                      onClick={() => startEditing(item.type)}
                    >
                      <FaEdit size={16} />
                    </button>
                  </div>
                </>
              )}

              {editingField === item.type && (
                <div className="form-item-edit">
                  <div className="form-edit-label">
                    <span className="form-icon">{item.icon}</span>
                    <span className="form-label">{item.label}</span>
                  </div>
                  {renderEditBox()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 新增底部保存按钮，点击触发保存逻辑 */}
        <div className="profile-save-bottom">
          <button
            className="save-button-bottom"
            onClick={handleSave}
            disabled={submitLoading || editingField}
          >
            {submitLoading ? '保存中...' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileEditPage
