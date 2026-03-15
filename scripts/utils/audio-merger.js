import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync, readFileSync, writeFileSync, createReadStream, createWriteStream } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)

export async function mergeAudioFiles(inputFiles, outputPath) {
  if (inputFiles.length === 0) {
    throw new Error('No input files provided')
  }
  
  if (inputFiles.length === 1) {
    const content = readFileSync(inputFiles[0])
    writeFileSync(outputPath, content)
    return outputPath
  }
  
  const hasFfmpeg = await checkFfmpeg()
  
  if (hasFfmpeg) {
    return await mergeWithFfmpeg(inputFiles, outputPath)
  } else {
    return await mergeSimple(inputFiles, outputPath)
  }
}

async function checkFfmpeg() {
  try {
    await execAsync('ffmpeg -version')
    return true
  } catch (e) {
    return false
  }
}

async function mergeWithFfmpeg(inputFiles, outputPath) {
  const listFile = outputPath + '.txt'
  const listContent = inputFiles.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n')
  writeFileSync(listFile, listContent)
  
  try {
    const { stdout, stderr } = await execAsync(
      `ffmpeg -f concat -safe 0 -i "${listFile}" -c copy "${outputPath}" -y`,
      { maxBuffer: 100 * 1024 * 1024 }
    )
    
    const fs = await import('fs')
    fs.unlinkSync(listFile)
    
    return outputPath
  } catch (error) {
    const fs = await import('fs')
    try {
      fs.unlinkSync(listFile)
    } catch (e) {}
    
    return await mergeSimple(inputFiles, outputPath)
  }
}

async function mergeSimple(inputFiles, outputPath) {
  return new Promise((resolve, reject) => {
    const writeStream = createWriteStream(outputPath)
    
    let currentIndex = 0
    
    function appendNext() {
      if (currentIndex >= inputFiles.length) {
        writeStream.end()
        resolve(outputPath)
        return
      }
      
      const readStream = createReadStream(inputFiles[currentIndex])
      
      readStream.on('end', () => {
        currentIndex++
        appendNext()
      })
      
      readStream.on('error', (err) => {
        writeStream.end()
        reject(err)
      })
      
      readStream.pipe(writeStream, { end: false })
    }
    
    writeStream.on('error', reject)
    appendNext()
  })
}

export async function getAudioDuration(filePath) {
  const hasFfmpeg = await checkFfmpeg()
  
  if (!hasFfmpeg) {
    return null
  }
  
  try {
    const { stdout } = await execAsync(
      `ffprobe -i "${filePath}" -show_entries format=duration -v quiet -of csv="p=0"`
    )
    return parseFloat(stdout.trim())
  } catch (e) {
    return null
  }
}
