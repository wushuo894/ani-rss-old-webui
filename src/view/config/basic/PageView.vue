<template>
  <el-dialog v-model="jsDialogVisible" align-center center title="自定义JS" width="800">
    <el-input v-model:model-value="props.config['customJs']" :rows="6"
              type="textarea"/>
    <div class="flex justify-end full-width mt-8">
      <el-link type="primary" href="https://github.com/wushuo894/ani-rss-css"
               target="_blank">更多CSS
      </el-link>
    </div>
    <div class="flex justify-end full-width mt-8">
      <el-button bg icon="Close" text @click="jsDialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
  <el-dialog v-model="cssDialogVisible" align-center center title="自定义CSS" width="800">
    <el-input v-model:model-value="props.config['customCss']" :rows="6"
              type="textarea"/>
    <div class="flex justify-end full-width mt-8">
      <el-button bg icon="Close" text @click="cssDialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
  <el-form @submit.prevent label-width="auto"
           class="full-width">
    <el-form-item label="外观">
      <el-radio-group v-model="store">
        <el-radio-button label="自动" value="auto">
          <template #default>
            <el-icon>
              <Adjust/>
            </el-icon>
          </template>
        </el-radio-button>
        <el-radio-button label="浅色" value="light">
          <el-icon>
            <Sun/>
          </el-icon>
        </el-radio-button>
        <el-radio-button label="深色" value="dark">
          <el-icon>
            <Moon/>
          </el-icon>
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="主题色">
      <el-color-picker v-model="color" :predefine="predefineColors"
                       @blur="colorChange(color)"
                       @change="colorChange(color)"
                       @active-change="colorChange"/>
    </el-form-item>
    <el-form-item label="排序">
      <el-select v-model="props.config['sortType']" class="width-150">
        <el-option value="SCORE" label="评分"/>
        <el-option value="PINYIN" label="拼音"/>
        <el-option value="DOWNLOAD_TIME" label="更新时间"/>
      </el-select>
    </el-form-item>
    <el-form-item label="最大内容宽度">
      <el-input-number v-model="maxContentWidth"
                       :min="1200">
        <template #suffix>
          <span>px</span>
        </template>
      </el-input-number>
    </el-form-item>
    <el-form-item label="其他">
      <el-checkbox v-model="showScore" label="显示评分"/>
      <el-checkbox v-model="showWeek" label="按星期展示"/>
      <el-checkbox v-model="showPlaylist" label="显示视频列表"/>
      <el-checkbox v-model="showLastDownloadTime" label="显示更新时间"/>
    </el-form-item>
    <el-form-item label="自定义">
      <el-button bg @click="jsDialogVisible = true">
        <template #icon>
          <Js/>
        </template>
        JavaScript
      </el-button>
      <el-button bg @click="cssDialogVisible = true">
        <template #icon>
          <Css3Alt/>
        </template>
        CSS
      </el-button>
    </el-form-item>
    <el-form-item label="WebUI">
      <div class="webui-actions">
        <UploadView
            :disabled="!!webUIAction"
            :callback="uploadCallback"
            :extensions="['zip']"
            url="api/webui/upload">
          <template #default="{ uploading }">
            <el-button :loading="uploading" bg icon="Upload">上传 ZIP</el-button>
          </template>
        </UploadView>
        <el-button
            :disabled="!!webUIAction"
            :loading="webUIAction === 'check'"
            bg
            icon="Refresh"
            @click="checkWebUIUpdate">
          检查更新
        </el-button>
        <el-button
            :disabled="!webUIUpdateInfo?.update || !!webUIAction"
            :loading="webUIAction === 'update'"
            bg
            icon="Top"
            type="success"
            @click="updateWebUI">
          更新<span v-if="webUIUpdateInfo?.latest">至 v{{ webUIUpdateInfo.latest }}</span>
        </el-button>
        <PopconfirmView title="删除自定义 WebUI 并恢复内置界面?" @confirm="deleteWebUI">
          <template #reference>
            <el-button
                :disabled="!!webUIAction"
                :loading="webUIAction === 'delete'"
                bg
                icon="Delete"
                type="danger">
              删除
            </el-button>
          </template>
        </PopconfirmView>
        <el-text v-if="webUIUpdateMessage" size="small" type="info">
          {{ webUIUpdateMessage }}
        </el-text>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup>
import {ref} from "vue";
import {Adjust, Css3Alt, Js, Moon, Sun} from "@vicons/fa";
import {
  color,
  colorChange,
  maxContentWidth,
  showLastDownloadTime,
  showPlaylist,
  showScore,
  showWeek,
  store
} from "@/js/global.js";
import {ElMessage} from "element-plus";
import UploadView from "@/view/custom/UploadView.vue";
import PopconfirmView from "@/view/custom/PopconfirmView.vue";
import * as http from "@/js/http.js";

let predefineColors = ref([
  '#409eff', '#109D58', '#BF3545', '#CB7574',
  '#9AAEC7', '#2EC5B6', '#1C1C1C', '#F7B1A9',
  '#B18874', '#E9BA86', '#F68F6C', '#F0458B',
  '#C35653', '#40494E', '#6F0000', '#8D3647',
  '#E6C5D0', '#2377B3', '#49312D', '#7C9AB6',
  '#A5B18D', '#E8662A', '#AB5D50'
])

let jsDialogVisible = ref(false)
let cssDialogVisible = ref(false)

let reload = () => setTimeout(() => location.reload(), 1000)

let uploadCallback = res => {
  let {code, message} = res
  if (code === 200) {
    ElMessage.success(message)
    reload()
    return
  }
  ElMessage.error(message)
}

let webUIAction = ref('')
let webUIUpdateInfo = ref()
let webUIUpdateMessage = ref('')

let checkWebUIUpdate = () => {
  webUIAction.value = 'check'
  webUIUpdateMessage.value = ''
  http.getWebUIUpdate()
      .then(res => {
        webUIUpdateInfo.value = res.data
        if (res.data.update) {
          webUIUpdateMessage.value = `发现新版本 v${res.data.latest}`
        } else if (res.data.latest) {
          webUIUpdateMessage.value = `当前已是最新版本 v${res.data.latest}`
        } else {
          webUIUpdateMessage.value = '暂未发现可用更新'
        }
      })
      .finally(() => {
        webUIAction.value = ''
      })
}

let updateWebUI = () => {
  webUIAction.value = 'update'
  http.updateWebUI()
      .then(res => {
        ElMessage.success(res.message)
        reload()
      })
      .finally(() => {
        webUIAction.value = ''
      })
}

let deleteWebUI = () => {
  webUIAction.value = 'delete'
  http.deleteWebUI()
      .then(res => {
        ElMessage.success(res.message)
        reload()
      })
      .finally(() => {
        webUIAction.value = ''
      })
}

let props = defineProps(['config'])
</script>

<style scoped>
.justify-end {
  justify-content: end;
}

.mt-8 {
  margin-top: 8px;
}

.webui-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.webui-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
</style>
