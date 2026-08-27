export const normalizeExtensions = extensions => extensions
    .map(extension => String(extension).replace(/^\./, '').trim().toLowerCase())
    .filter(Boolean)

export const fileExtension = filename => filename
    ?.match(/\.([^.]+)$/)?.[1]
    ?.toLowerCase()

export const acceptsFile = (file, extensions) => {
    const accepted = normalizeExtensions(extensions)
    return accepted.length === 0 || accepted.includes(fileExtension(file?.name))
}

export const parseUploadResponse = async response => {
    const text = await response.text()
    let payload

    try {
        payload = JSON.parse(text)
    } catch {
        throw new Error(response.ok ? '服务器返回格式错误' : `上传失败 (${response.status})`)
    }

    if (!response.ok) {
        throw new Error(payload.message || `上传失败 (${response.status})`)
    }

    return payload
}

export const uploadFile = async ({url, file, extensions, authorization, fetchImpl = fetch}) => {
    if (!file) {
        throw new Error('文件为空')
    }
    if (!acceptsFile(file, extensions)) {
        throw new Error('文件格式错误')
    }

    const formData = new FormData()
    formData.append('file', file)

    const headers = {}
    if (authorization) {
        headers.Authorization = authorization
    }

    const response = await fetchImpl(url, {
        method: 'POST',
        body: formData,
        headers
    })

    return parseUploadResponse(response)
}
