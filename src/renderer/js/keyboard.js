// Virtual Keyboard Module
class VirtualKeyboard {
    constructor() {
        this.pressedKeys = new Set();
        this.keymap = {
            'q': 'Q', 'w': 'W', 'e': 'E', 'r': 'R', 't': 'T', 'y': 'Y', 'u': 'U', 'i': 'I', 'o': 'O', 'p': 'P',
            'a': 'A', 's': 'S', 'd': 'D', 'f': 'F', 'g': 'G', 'h': 'H', 'j': 'J', 'k': 'K', 'l': 'L',
            'z': 'Z', 'x': 'X', 'c': 'C', 'v': 'V', 'b': 'B', 'n': 'N', 'm': 'M',
            '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '0': '0',
            '-': '-', '=': '=', '[': '[', ']': ']', ';': ';', "'": "'", ',': ',', '.': '.', '/': '/'
        };
        
        this.layout = [
            ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BKSP'],
            ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
            ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'],
            ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'],
            ['CTRL', 'ALT', 'SPACE', 'ALT', 'CTRL']
        ];
        
        this.init();
    }
    
    init() {
        this.createKeyboard();
        this.attachEventListeners();
        this.attachPhysicalKeyboardListeners();
    }
    
    createKeyboard() {
        const keyboard = document.getElementById('keyboard');
        if (!keyboard) return;
        
        keyboard.innerHTML = '';
        
        this.layout.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.style.display = 'flex';
            rowDiv.style.gap = '5px';
            rowDiv.style.marginBottom = '5px';
            rowDiv.style.justifyContent = 'center';
            
            row.forEach(keyLabel => {
                const keyEl = document.createElement('button');
                keyEl.className = 'key';
                keyEl.textContent = keyLabel;
                keyEl.dataset.key = keyLabel;
                
                if (keyLabel === 'SPACE') {
                    keyEl.classList.add('key-space');
                    keyEl.style.minWidth = '300px';
                } else if (['SHIFT', 'CTRL', 'ALT'].includes(keyLabel)) {
                    keyEl.style.minWidth = '80px';
                } else if (keyLabel === 'ENTER') {
                    keyEl.style.minWidth = '80px';
                } else if (keyLabel === 'BKSP') {
                    keyEl.style.minWidth = '80px';
                } else if (keyLabel === 'TAB') {
                    keyEl.style.minWidth = '60px';
                } else if (keyLabel === 'CAPS') {
                    keyEl.style.minWidth = '80px';
                } else if (keyLabel === 'ESC') {
                    keyEl.style.minWidth = '60px';
                }
                
                rowDiv.appendChild(keyEl);
            });
            
            keyboard.appendChild(rowDiv);
        });
    }
    
    attachEventListeners() {
        const keyboard = document.getElementById('keyboard');
        if (!keyboard) return;
        
        keyboard.addEventListener('click', (e) => {
            if (e.target.classList.contains('key')) {
                this.pressKey(e.target.dataset.key);
            }
        });
    }
    
    attachPhysicalKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            this.pressedKeys.add(e.code);
            this.updateKeyboardDisplay();
        });
        
        document.addEventListener('keyup', (e) => {
            this.pressedKeys.delete(e.code);
            this.updateKeyboardDisplay();
        });
    }
    
    pressKey(key) {
        let eventKey = key;
        let code = key;
        
        const codeMap = {
            'ESC': 'Escape',
            'TAB': 'Tab',
            'CAPS': 'CapsLock',
            'SHIFT': 'Shift',
            'CTRL': 'Control',
            'ALT': 'Alt',
            'SPACE': ' ',
            'ENTER': 'Enter',
            'BKSP': 'Backspace'
        };
        
        if (codeMap[key]) {
            eventKey = codeMap[key];
            code = key;
        }
        
        const event = new KeyboardEvent('keydown', {
            key: eventKey,
            code: code,
            bubbles: true,
            cancelable: true
        });
        
        const focused = document.activeElement;
        if (focused) {
            focused.dispatchEvent(event);
        }
    }
    
    updateKeyboardDisplay() {
        const keyboard = document.getElementById('keyboard');
        if (!keyboard) return;
        
        const keys = keyboard.querySelectorAll('.key');
        keys.forEach(key => {
            const keyLabel = key.dataset.key;
            let isPressed = false;
            
            // Check if key is physically pressed
            const codeMap = {
                'ESC': 'Escape',
                'TAB': 'Tab',
                'CAPS': 'CapsLock',
                'SHIFT': 'ShiftLeft',
                'CTRL': 'ControlLeft',
                'ALT': 'AltLeft',
                'SPACE': 'Space',
                'ENTER': 'Enter',
                'BKSP': 'Backspace'
            };
            
            if (codeMap[keyLabel]) {
                isPressed = this.pressedKeys.has(codeMap[keyLabel]);
            } else if (keyLabel.match(/^[A-Z0-9]$/)) {
                // Check uppercase letter codes
                isPressed = this.pressedKeys.has('Key' + keyLabel) || 
                           this.pressedKeys.has('Digit' + keyLabel);
            }
            
            if (isPressed) {
                key.classList.add('pressed');
                key.style.opacity = '0.5';
            } else {
                key.classList.remove('pressed');
                key.style.opacity = '1';
            }
        });
    }
}

const keyboard = new VirtualKeyboard();
