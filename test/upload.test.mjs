import assert from 'node:assert/strict'
import test from 'node:test'
import {
    acceptsFile,
    fileExtension,
    normalizeExtensions,
    parseUploadResponse
} from '../src/js/upload.js'

test('normalizes file extensions without relying on MIME types', () => {
    assert.deepEqual(normalizeExtensions(['.ZIP', ' json ', '']), ['zip', 'json'])
    assert.equal(fileExtension('ANI-RSS-Old-WebUI.ZIP'), 'zip')
    assert.equal(acceptsFile({name: 'webui.zip', type: ''}, ['zip']), true)
    assert.equal(acceptsFile({name: 'webui.tar.gz'}, ['zip']), false)
})

test('accepts every file when no extension filter is configured', () => {
    assert.equal(acceptsFile({name: 'anything.bin'}, []), true)
})

test('returns a JSON upload response', async () => {
    const response = new Response(JSON.stringify({code: 200, message: 'ok'}), {status: 200})
    assert.deepEqual(await parseUploadResponse(response), {code: 200, message: 'ok'})
})

test('uses the server message for failed HTTP responses', async () => {
    const response = new Response(JSON.stringify({message: '文件格式错误'}), {status: 400})
    await assert.rejects(() => parseUploadResponse(response), /文件格式错误/)
})

test('reports non-JSON server responses', async () => {
    const response = new Response('Bad Gateway', {status: 502})
    await assert.rejects(() => parseUploadResponse(response), /上传失败 \(502\)/)
})
