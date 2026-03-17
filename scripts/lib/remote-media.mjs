import { spawn } from "node:child_process"

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`
}

function formatCommand(command, args) {
  return [command, ...args].map(shellEscape).join(" ")
}

export function createSshOptions({ port, sshKeyPath, sshKnownHostsPath }) {
  const args = ["-p", String(port), "-o", "BatchMode=yes", "-o", "StrictHostKeyChecking=yes"]

  if (sshKeyPath) {
    args.push("-i", sshKeyPath)
  }

  if (sshKnownHostsPath) {
    args.push("-o", `UserKnownHostsFile=${sshKnownHostsPath}`)
  }

  return args
}

export async function runCommand(command, args, { dryRun }) {
  if (dryRun) {
    console.log(`Would run: ${formatCommand(command, args)}`)
    return
  }

  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit"
    })

    child.on("error", reject)
    child.on("close", (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} exited with code ${code}`))
    })
  })
}

export async function uploadFiles({ dryRun, files, host, remoteDir, sshOptions, user }) {
  const remote = `${user}@${host}`

  await runCommand("ssh", [...sshOptions, remote, "mkdir", "-p", remoteDir], {
    dryRun
  })

  const sshTransport = ["ssh", ...sshOptions].map(shellEscape).join(" ")
  await runCommand("rsync", ["-az", "-e", sshTransport, ...files, `${remote}:${remoteDir}/`], {
    dryRun
  })
}
