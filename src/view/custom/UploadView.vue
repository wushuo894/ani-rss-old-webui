<template>
  <input ref="inputRef" :accept="accept" hidden="hidden" type="file" @change="changeFile">
  <div
      @click="selectAndUpload"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      :class="{ 'upload-dragover': isDragOver, 'upload-disabled': props.disabled }"
      style="display: inline-block;"
  >
    <slot :uploading="uploading"/>
  </div>
</template>

<style scoped>
.upload-dragover {
  outline: 2px dashed var(--el-color-primary);
  outline-offset: 2px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 4px;
}

.upload-disabled {
  pointer-events: none;
}
</style>

<script setup>

import {computed, ref} from "vue";
import {authorization} from "@/js/global.js";
import {normalizeExtensions, uploadFile} from "@/js/upload.js";

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  extensions: {
    type: Array,
    default: () => []
  },
  callback: Function,
  disabled: Boolean
})

let inputRef = ref()
let isDragOver = ref(false)
let dragCounter = ref(0)
let uploading = ref(false)
let acceptedExtensions = computed(() => normalizeExtensions(props.extensions))
let accept = computed(() => acceptedExtensions.value.map(extension => `.${extension}`).join(','))

let selectAndUpload = () => {
  if (props.disabled || uploading.value) {
    return
  }
  inputRef.value.value = ''
  inputRef.value.click()
}

let handleUpload = async file => {
  if (uploading.value) {
    return
  }

  uploading.value = true
  let response
  try {
    response = await uploadFile({
      url: props.url,
      file,
      extensions: acceptedExtensions.value,
      authorization: authorization.value
    })
  } catch (error) {
    response = {code: 500, message: error.message}
  }

  try {
    await props.callback?.(response, file)
  } finally {
    uploading.value = false
  }
}

let changeFile = event => {
  handleUpload(event.target.files[0])
}

let onDragEnter = () => {
  dragCounter.value++
  isDragOver.value = true
}

let onDragOver = () => {
  // 必须 preventDefault 否则 drop 不会触发，已在模板用 .prevent
}

let onDragLeave = () => {
  dragCounter.value--
  if (dragCounter.value <= 0) {
    isDragOver.value = false
    dragCounter.value = 0
  }
}

let onDrop = (e) => {
  isDragOver.value = false
  dragCounter.value = 0

  const files = e.dataTransfer?.files
  if (!files || files.length === 0) {
    return
  }
  // 与点击上传保持一致：只上传第一个文件
  handleUpload(files[0])
}

defineExpose({
  selectAndUpload,
  uploading
})
</script>
