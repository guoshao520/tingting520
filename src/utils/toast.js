import { Toast } from 'antd-mobile'

export function toastMsg (content) {
  Toast.show({
    content,
  })
}

export function toastSuccess (content) {
  Toast.show({
    icon: 'success',
    content,
  })
}

export function toastFail (content) {
  Toast.show({
    icon: 'fail',
    content,
  })
}

export function toastLoading (content) {
  Toast.show({
    icon: 'loading',
    content,
  })
}



