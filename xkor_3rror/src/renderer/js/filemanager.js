// File Manager Module
class FileManager {
    constructor() {
        this.currentPath = process.env.HOME || '/home/user';
        this.selectedFile = null;
        this.clipboard = null;
        this.clipboardOp = null; // 'copy' or 'cut'
        this.init();
    }
    
    init() {
        this.loadDirectory(this.currentPath);
        
        // Refresh file list when needed
        this.updateFileList();
    }
    
    async loadDirectory(path) {
        try {
            const data = await apiCall(`/files/list?path=${encodeURIComponent(path)}`);
            if (data && data.files) {
                this.currentPath = path;
                this.displayFiles(data.files);
                this.updateBreadcrumb();
            }
        } catch (error) {
            console.error('Failed to load directory:', error);
        }
    }
    
    displayFiles(files) {
        const fileList = document.getElementById('file-list');
        if (!fileList) return;
        
        fileList.innerHTML = '';
        
        // Add parent directory
        const parentItem = document.createElement('div');
        parentItem.className = 'file-item';
        parentItem.innerHTML = '<span class="file-icon">📁</span><span class="file-name">..</span>';
        parentItem.addEventListener('dblclick', () => {
            const parentPath = this.currentPath.substring(0, this.currentPath.lastIndexOf('/')) || '/';
            this.loadDirectory(parentPath);
        });
        fileList.appendChild(parentItem);
        
        // Sort: directories first, then files
        const dirs = files.filter(f => f.type === 'dir').sort((a, b) => a.name.localeCompare(b.name));
        const filesList = files.filter(f => f.type === 'file').sort((a, b) => a.name.localeCompare(b.name));
        const allFiles = [...dirs, ...filesList];
        
        allFiles.forEach(file => {
            const item = document.createElement('div');
            item.className = 'file-item';
            
            const icon = file.type === 'dir' ? '📁' : '📄';
            item.innerHTML = `<span class="file-icon">${icon}</span><span class="file-name">${file.name}</span>`;
            
            item.addEventListener('click', () => {
                document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                this.selectedFile = file;
            });
            
            item.addEventListener('dblclick', () => {
                if (file.type === 'dir') {
                    const newPath = this.currentPath.endsWith('/') 
                        ? this.currentPath + file.name 
                        : this.currentPath + '/' + file.name;
                    this.loadDirectory(newPath);
                } else {
                    // Open file preview or action
                    this.openFile(file);
                }
            });
            
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.selectedFile = file;
                item.classList.add('selected');
                this.showContextMenu(e.clientX, e.clientY, file);
            });
            
            fileList.appendChild(item);
        });
    }
    
    showContextMenu(x, y, file) {
        const items = [
            { label: 'OPEN', callback: () => {
                if (file.type === 'dir') {
                    const newPath = this.currentPath.endsWith('/') 
                        ? this.currentPath + file.name 
                        : this.currentPath + '/' + file.name;
                    this.loadDirectory(newPath);
                } else {
                    this.openFile(file);
                }
            }},
            { label: 'COPY', callback: () => {
                this.clipboard = file;
                this.clipboardOp = 'copy';
            }},
            { label: 'CUT', callback: () => {
                this.clipboard = file;
                this.clipboardOp = 'cut';
            }},
            { label: 'PASTE', callback: () => {
                if (this.clipboard) {
                    const srcPath = this.currentPath + '/' + this.clipboard.name;
                    const dstPath = this.currentPath + '/' + this.clipboard.name;
                    
                    if (this.clipboardOp === 'copy') {
                        this.copyFile(srcPath, dstPath);
                    } else if (this.clipboardOp === 'cut') {
                        this.moveFile(srcPath, dstPath);
                    }
                }
            }},
            { label: 'DELETE', callback: () => {
                if (confirm(`Delete ${file.name}?`)) {
                    this.deleteFile(file);
                }
            }},
            { label: 'RENAME', callback: () => {
                const newName = prompt('New name:', file.name);
                if (newName && newName !== file.name) {
                    this.renameFile(file, newName);
                }
            }}
        ];
        
        showContextMenu(x, y, items);
    }
    
    async openFile(file) {
        try {
            const data = await apiCall(`/files/read?path=${encodeURIComponent(this.currentPath + '/' + file.name)}`);
            if (data && data.content) {
                // Show in a modal or new terminal
                alert(`File: ${file.name}\n\n${data.content.substring(0, 1000)}${data.content.length > 1000 ? '\n...' : ''}`);
            }
        } catch (error) {
            console.error('Failed to open file:', error);
        }
    }
    
    async deleteFile(file) {
        try {
            const path = this.currentPath.endsWith('/') 
                ? this.currentPath + file.name 
                : this.currentPath + '/' + file.name;
            await apiCall(`/files/delete`, 'DELETE', { path });
            this.loadDirectory(this.currentPath);
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    }
    
    async renameFile(file, newName) {
        try {
            const oldPath = this.currentPath.endsWith('/') 
                ? this.currentPath + file.name 
                : this.currentPath + '/' + file.name;
            const newPath = this.currentPath.endsWith('/') 
                ? this.currentPath + newName 
                : this.currentPath + '/' + newName;
            
            await apiCall(`/files/rename`, 'POST', { oldPath, newPath });
            this.loadDirectory(this.currentPath);
        } catch (error) {
            console.error('Failed to rename file:', error);
        }
    }
    
    async copyFile(src, dst) {
        try {
            await apiCall(`/files/copy`, 'POST', { src, dst });
            this.loadDirectory(this.currentPath);
        } catch (error) {
            console.error('Failed to copy file:', error);
        }
    }
    
    async moveFile(src, dst) {
        try {
            await apiCall(`/files/move`, 'POST', { src, dst });
            this.loadDirectory(this.currentPath);
        } catch (error) {
            console.error('Failed to move file:', error);
        }
    }
    
    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;
        
        const parts = this.currentPath.split('/').filter(p => p);
        let html = '<span class="breadcrumb-item" data-path="/">/</span>';
        
        let path = '';
        parts.forEach((part, i) => {
            path += '/' + part;
            html += ` <span class="breadcrumb-item" data-path="${path}">${part}</span>`;
        });
        
        breadcrumb.innerHTML = html;
        
        breadcrumb.querySelectorAll('.breadcrumb-item').forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                const path = item.getAttribute('data-path') || '/';
                this.loadDirectory(path);
            });
        });
    }
    
    updateFileList() {
        // This is called after file operations
        setInterval(() => {
            // Could add auto-refresh if needed
        }, 5000);
    }
}

const fileManager = new FileManager();
