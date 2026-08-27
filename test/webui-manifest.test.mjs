import assert from 'node:assert/strict'
import test from 'node:test'
import {createWebUIManifest, normalizeVersion} from '../scripts/webui-manifest.mjs'

test('creates the WebUIController release manifest', () => {
    assert.deepEqual(createWebUIManifest({
        owner: 'wushuo894',
        repo: 'ani-rss-old-webui',
        version: 'v3.2.18',
        filename: 'ani-rss-old-webui.zip'
    }), {
        owner: 'wushuo894',
        repo: 'ani-rss-old-webui',
        version: '3.2.18',
        filename: 'ani-rss-old-webui.zip'
    })
})

test('normalizes only the release tag prefix', () => {
    assert.equal(normalizeVersion('V3.2.19'), '3.2.19')
})

test('rejects invalid release filenames', () => {
    assert.throws(() => createWebUIManifest({
        owner: 'wushuo894',
        repo: 'ani-rss-old-webui',
        version: '3.2.18',
        filename: 'ani-rss-old-webui.tar.gz'
    }), /must end with \.zip/)
})
