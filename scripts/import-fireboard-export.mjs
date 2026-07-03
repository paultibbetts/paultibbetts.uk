#!/usr/bin/env node

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { hasHelpFlag, parseCliArgs } from "./lib/media-cli.mjs"

const DEFAULT_BASENAME = "fireboard"
const COLORS = ["#ffb86c", "#f51a6f", "#bd93f9", "#8be9fd", "#50fa7b", "#ff5555"]
const CHART = {
  height: 320,
  paddingBottom: 36,
  paddingLeft: 48,
  paddingRight: 16,
  paddingTop: 16,
  width: 800
}

function printUsage() {
  console.log(`
Usage:
  node scripts/import-fireboard-export.mjs <csv-path> <post-bundle-dir> [options]

Options:
  --basename <name>       Output basename for CSV and JSON files (default: fireboard)
  --utc-offset <offset>   Offset for CSV timestamps, e.g. +01:00 (default: inferred from CSV header or +00:00)

Examples:
  node scripts/import-fireboard-export.mjs "FireBoard - Pulled Pork.csv" content/cooks/2026-07-03-pulled-pork --utc-offset +01:00
`)
}

function parseCsv(content) {
  const rows = []
  let field = ""
  let row = []
  let inQuotes = false

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    const next = content[index + 1]

    if (char === '"' && inQuotes && next === '"') {
      field += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === "," && !inQuotes) {
      row.push(field)
      field = ""
      continue
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1
      }

      row.push(field)
      field = ""

      if (row.some((value) => value !== "")) {
        rows.push(row)
      }

      row = []
      continue
    }

    field += char
  }

  row.push(field)

  if (row.some((value) => value !== "")) {
    rows.push(row)
  }

  return rows
}

function inferUtcOffset(header) {
  const match = header.match(/\((-?\d+)\s+offset\)/i)

  if (!match) {
    return "+00:00"
  }

  const hours = Number.parseInt(match[1], 10)
  const sign = hours < 0 ? "-" : "+"
  return `${sign}${String(Math.abs(hours)).padStart(2, "0")}:00`
}

function parseUtcOffset(offset) {
  const match = offset.match(/^([+-])(\d{2}):?(\d{2})$/)

  if (!match) {
    throw new Error(`Invalid UTC offset: ${offset}`)
  }

  const sign = match[1] === "-" ? -1 : 1
  const hours = Number.parseInt(match[2], 10)
  const minutes = Number.parseInt(match[3], 10)
  return sign * (hours * 60 + minutes)
}

function parseFireboardTime(value, utcOffset) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/)

  if (!match) {
    throw new Error(`Unsupported FireBoard timestamp: ${value}`)
  }

  const [, month, day, shortYear, hour, minute, second] = match
  const year = 2000 + Number.parseInt(shortYear, 10)
  const offsetMinutes = parseUtcOffset(utcOffset)
  const timestamp =
    Date.UTC(
      year,
      Number.parseInt(month, 10) - 1,
      Number.parseInt(day, 10),
      Number.parseInt(hour, 10),
      Number.parseInt(minute, 10),
      Number.parseInt(second, 10)
    ) -
    offsetMinutes * 60 * 1000

  return {
    iso: `${year}-${month}-${day}T${hour}:${minute}:${second}${utcOffset}`,
    timestamp
  }
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours === 0) {
    return `${minutes}m`
  }

  return `${hours}h ${String(minutes).padStart(2, "0")}m`
}

function formatTimeLabel(timestamp, utcOffset) {
  const offsetMinutes = parseUtcOffset(utcOffset)
  const local = new Date(timestamp + offsetMinutes * 60 * 1000)
  return `${String(local.getUTCHours()).padStart(2, "0")}:${String(local.getUTCMinutes()).padStart(2, "0")}`
}

function chartScale({ start, end, min, max }) {
  const plotWidth = CHART.width - CHART.paddingLeft - CHART.paddingRight
  const plotHeight = CHART.height - CHART.paddingTop - CHART.paddingBottom
  const timeSpan = Math.max(end - start, 1)
  const tempSpan = Math.max(max - min, 1)

  return {
    x(timestamp) {
      return (
        Math.round((CHART.paddingLeft + ((timestamp - start) / timeSpan) * plotWidth) * 10) / 10
      )
    },
    y(value) {
      return Math.round((CHART.paddingTop + (1 - (value - min) / tempSpan) * plotHeight) * 10) / 10
    }
  }
}

function buildTicks(min, max, start, end, utcOffset) {
  const yTicks = []
  const tickCount = 5

  for (let index = 0; index < tickCount; index += 1) {
    const value = min + ((max - min) / (tickCount - 1)) * index
    yTicks.push(Math.round(value))
  }

  const xTicks = []
  const xTickCount = 4

  for (let index = 0; index < xTickCount; index += 1) {
    const timestamp = start + ((end - start) / (xTickCount - 1)) * index
    xTicks.push({
      label: formatTimeLabel(timestamp, utcOffset),
      timestamp
    })
  }

  return { xTicks, yTicks }
}

function summarizeSeries(name, readings) {
  const values = readings.map((reading) => reading.value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  return {
    first: readings[0].value,
    last: readings.at(-1).value,
    max,
    min,
    name,
    points: readings.length
  }
}

function roundTemperature(value) {
  return Math.round(value * 10) / 10
}

function positionalArgs(args) {
  const positional = []
  const flagsWithValues = new Set(["--basename", "--utc-offset"])

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (flagsWithValues.has(arg)) {
      index += 1
      continue
    }

    if (!arg.startsWith("--")) {
      positional.push(arg)
    }
  }

  return positional
}

function buildArchive(csvRows, { basename, csvFileName, utcOffset }) {
  const [headers, ...dataRows] = csvRows

  if (!headers || headers.length < 2) {
    throw new Error("FireBoard CSV must have a time column and at least one channel")
  }

  const timeHeader = headers[0]
  const channels = headers.slice(1).map((name, index) => ({
    color: COLORS[index % COLORS.length],
    name,
    readings: []
  }))

  for (const row of dataRows) {
    if (!row[0]) {
      continue
    }

    const time = parseFireboardTime(row[0], utcOffset)

    for (let index = 1; index < headers.length; index += 1) {
      const rawValue = row[index]

      if (!rawValue) {
        continue
      }

      const value = Number.parseFloat(rawValue)

      if (Number.isNaN(value)) {
        continue
      }

      channels[index - 1].readings.push({
        iso: time.iso,
        timestamp: time.timestamp,
        value: roundTemperature(value)
      })
    }
  }

  const populatedChannels = channels.filter((channel) => channel.readings.length > 0)
  const allReadings = populatedChannels.flatMap((channel) => channel.readings)

  if (allReadings.length === 0) {
    throw new Error("FireBoard CSV did not contain any temperature readings")
  }

  const start = Math.min(...allReadings.map((reading) => reading.timestamp))
  const end = Math.max(...allReadings.map((reading) => reading.timestamp))
  const values = allReadings.map((reading) => reading.value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const tempPadding = Math.max((rawMax - rawMin) * 0.08, 5)
  const min = Math.floor((rawMin - tempPadding) / 5) * 5
  const max = Math.ceil((rawMax + tempPadding) / 5) * 5
  const scale = chartScale({ end, max, min, start })
  const ticks = buildTicks(min, max, start, end, utcOffset)

  return {
    chart: {
      height: CHART.height,
      paddingBottom: CHART.paddingBottom,
      paddingLeft: CHART.paddingLeft,
      paddingRight: CHART.paddingRight,
      paddingTop: CHART.paddingTop,
      series: populatedChannels.map((channel) => ({
        color: channel.color,
        name: channel.name,
        points: channel.readings
          .map((reading) => `${scale.x(reading.timestamp)},${scale.y(reading.value)}`)
          .join(" ")
      })),
      width: CHART.width,
      xTicks: ticks.xTicks.map((tick) => ({
        label: tick.label,
        x: scale.x(tick.timestamp)
      })),
      yTicks: ticks.yTicks.map((value) => ({
        label: `${value}C`,
        value,
        y: scale.y(value)
      }))
    },
    csv: csvFileName,
    generatedAt: new Date().toISOString(),
    source: {
      basename,
      rows: dataRows.length,
      timeHeader,
      utcOffset
    },
    summary: {
      duration: formatDuration(Math.round((end - start) / 1000)),
      durationSeconds: Math.round((end - start) / 1000),
      end: new Date(end).toISOString(),
      endLabel: formatTimeLabel(end, utcOffset),
      maxTemperature: roundTemperature(rawMax),
      minTemperature: roundTemperature(rawMin),
      start: new Date(start).toISOString(),
      startLabel: formatTimeLabel(start, utcOffset)
    },
    channels: populatedChannels.map((channel) => summarizeSeries(channel.name, channel.readings))
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (hasHelpFlag(args)) {
    printUsage()
    return
  }

  const { input, options } = parseCliArgs(args, {
    defaults: {
      basename: DEFAULT_BASENAME
    },
    valueOptions: [
      { flag: "--basename", key: "basename" },
      { flag: "--utc-offset", key: "utcOffset" }
    ]
  })
  const postBundleDir = positionalArgs(args)[1]

  if (!input || !postBundleDir) {
    printUsage()
    process.exit(1)
  }

  const csvPath = path.resolve(input)
  const bundleDir = path.resolve(postBundleDir)
  const csvContent = await readFile(csvPath, "utf8")
  const csvRows = parseCsv(csvContent)
  const utcOffset = options.utcOffset || inferUtcOffset(csvRows[0]?.[0] || "")
  const csvFileName = `${options.basename}.csv`
  const jsonFileName = `${options.basename}.json`
  const archive = buildArchive(csvRows, {
    basename: options.basename,
    csvFileName,
    utcOffset
  })

  await mkdir(bundleDir, { recursive: true })
  await copyFile(csvPath, path.join(bundleDir, csvFileName))
  await writeFile(path.join(bundleDir, jsonFileName), `${JSON.stringify(archive, null, 2)}\n`)

  console.log(
    `Imported ${csvRows.length - 1} FireBoard rows to ${path.relative(process.cwd(), bundleDir)}`
  )
  console.log(`Wrote ${csvFileName} and ${jsonFileName}`)
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ""

if (import.meta.url === invokedPath) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
