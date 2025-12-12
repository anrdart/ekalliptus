<template>
  <div class="space-y-4">
    <!-- Drop Zone -->
    <div
      @drop.prevent="handleDrop"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @click="triggerFileInput"
      class="border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer"
      :class="[
        isDragging 
          ? 'border-primary bg-primary/10 scale-[1.02]' 
          : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-card/30',
        hasError ? 'border-destructive' : ''
      ]"
    >
      <input
        ref="fileInputRef"
        type="file"
        multiple
        :accept="acceptedTypes"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <Upload class="h-10 w-10 mx-auto text-muted-foreground mb-3" />
      <p class="text-foreground font-medium mb-1">
        {{ $t('order.attachments.dragDrop', 'Drag & drop files here') }}
      </p>
      <p class="text-sm text-muted-foreground">
        {{ $t('order.attachments.orClick', 'or click to browse') }}
      </p>
      <p class="text-xs text-muted-foreground mt-2">
        {{ $t('order.attachments.maxSize', 'Max 10MB per file, up to 5 files') }}
      </p>
      <p class="text-xs text-muted-foreground">
        {{ $t('order.attachments.allowedTypes', 'Images, PDF, DOC, DOCX, XLS, XLSX') }}
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="flex items-center gap-2 text-sm text-destructive">
      <AlertCircle class="h-4 w-4" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- File Previews -->
    <div v-if="files.length > 0" class="space-y-3">
      <p class="text-sm font-medium text-foreground">
        {{ $t('order.attachments.selectedFiles', 'Selected files') }} ({{ files.length }}/{{ maxFiles }})
      </p>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="(file, index) in files"
          :key="file.name + index"
          class="glass-panel rounded-xl p-3 flex items-center gap-3"
        >
          <!-- Image Preview (Requirements 5.2) -->
          <div v-if="isImage(file)" class="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            <img
              :src="getPreviewUrl(file)"
              :alt="file.name"
              width="48"
              height="48"
              loading="lazy"
              class="h-full w-full object-cover"
            />
          </div>
          
          <!-- File Icon for non-images -->
          <div v-else class="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted">
            <FileIcon class="h-6 w-6 text-muted-foreground" />
          </div>
          
          <!-- File Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground truncate">{{ file.name }}</p>
            <p class="text-xs text-muted-foreground">{{ formatFileSize(file.size) }}</p>
          </div>
          
          <!-- Remove Button -->
          <button
            type="button"
            @click.stop="removeFile(index)"
            class="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Upload, X, AlertCircle, File as FileIcon } from 'lucide-vue-next'

// Props
interface Props {
  modelValue: File[]
  maxFiles?: number
  maxSizeBytes?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxFiles: 5,
  maxSizeBytes: 10 * 1024 * 1024 // 10MB
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [files: File[]]
}>()

// State
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const errorMessage = ref('')
const previewUrls = ref<Map<string, string>>(new Map())

// Computed
const files = computed(() => props.modelValue)
const hasError = computed(() => !!errorMessage.value)

// Accepted file types
const acceptedTypes = 'image/*,.pdf,.doc,.docx,.xls,.xlsx'
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

// Methods
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const onDragOver = () => {
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const droppedFiles = event.dataTransfer?.files
  if (droppedFiles) {
    processFiles(Array.from(droppedFiles))
  }
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    processFiles(Array.from(input.files))
    // Reset input so same file can be selected again
    input.value = ''
  }
}

const processFiles = (newFiles: File[]) => {
  errorMessage.value = ''
  
  // Check total file count
  const totalFiles = files.value.length + newFiles.length
  if (totalFiles > props.maxFiles) {
    errorMessage.value = `Maksimal ${props.maxFiles} file`
    return
  }
  
  const validFiles: File[] = []
  
  for (const file of newFiles) {
    // Validate file type
    if (!isValidFileType(file)) {
      errorMessage.value = `Tipe file tidak didukung: ${file.name}`
      continue
    }
    
    // Validate file size
    if (file.size > props.maxSizeBytes) {
      errorMessage.value = `File terlalu besar (max 10MB): ${file.name}`
      continue
    }
    
    // Check for duplicates
    const isDuplicate = files.value.some(f => f.name === file.name && f.size === file.size)
    if (isDuplicate) {
      continue
    }
    
    validFiles.push(file)
    
    // Create preview URL for images
    if (isImage(file)) {
      const url = URL.createObjectURL(file)
      previewUrls.value.set(file.name + file.size, url)
    }
  }
  
  if (validFiles.length > 0) {
    emit('update:modelValue', [...files.value, ...validFiles])
  }
}

const isValidFileType = (file: File): boolean => {
  // Check MIME type
  if (allowedMimeTypes.includes(file.type)) {
    return true
  }
  
  // Fallback: check extension
  const ext = file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx']
  return ext ? allowedExtensions.includes(ext) : false
}

const isImage = (file: File): boolean => {
  return file.type.startsWith('image/')
}

const getPreviewUrl = (file: File): string => {
  return previewUrls.value.get(file.name + file.size) || ''
}

const removeFile = (index: number) => {
  const file = files.value[index]
  
  // Revoke preview URL if exists
  const key = file.name + file.size
  const url = previewUrls.value.get(key)
  if (url) {
    URL.revokeObjectURL(url)
    previewUrls.value.delete(key)
  }
  
  const newFiles = [...files.value]
  newFiles.splice(index, 1)
  emit('update:modelValue', newFiles)
  errorMessage.value = ''
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Cleanup preview URLs on unmount
onUnmounted(() => {
  previewUrls.value.forEach(url => URL.revokeObjectURL(url))
})
</script>
