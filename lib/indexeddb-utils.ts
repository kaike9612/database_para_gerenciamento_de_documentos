export function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("DocumentsDB", 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id" })
      }
    }
  })
}

export function saveFileToIndexedDB(db: IDBDatabase, id: string, fileData: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["files"], "readwrite")
    const store = transaction.objectStore("files")
    const request = store.put({ id, fileData })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export function getFileFromIndexedDB(db: IDBDatabase, id: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["files"], "readonly")
    const store = transaction.objectStore("files")
    const request = store.get(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const result = request.result
      resolve(result ? result.fileData : null)
    }
  })
}

export function deleteFileFromIndexedDB(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["files"], "readwrite")
    const store = transaction.objectStore("files")
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
