const required = (name, value) => {
    const normalized = String(value ?? '').trim()
    if (!normalized) {
        throw new Error(`${name} is required`)
    }
    return normalized
}

export const normalizeVersion = value => required('version', value).replace(/^v/i, '')

export const createWebUIManifest = ({owner, repo, version, filename}) => {
    const manifest = {
        owner: required('owner', owner),
        repo: required('repo', repo),
        version: normalizeVersion(version),
        filename: required('filename', filename)
    }

    if (!manifest.filename.toLowerCase().endsWith('.zip')) {
        throw new Error('filename must end with .zip')
    }

    return manifest
}
