



/*
export default function Test() {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div style={{ height: '500px' }}>
            <button onClick={() => setIsVisible(!isVisible)} className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded">
                VSCode
            </button>
            <button onClick={() => setIsVisible(!isVisible)} className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded">
                Terminal
            </button>
            {isVisible && <Editor
                height="70%"
                width={"80%"}
                defaultLanguage="javascript"
                defaultValue="// write some code here"
            />}
        </div>
    )
}
*/



'use client'
import Editor from '@monaco-editor/react';
import { useState } from 'react';
import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import styles from './test.module.css'
import UserAvatarSvg from '../components/ui/userAvatar/UserAvatarSvg';

export default function Test() {
    const terminalRef = useRef<HTMLDivElement | null>(null);
    const termRef = useRef<Terminal | null>(null);

    const [isEditorVisible, setIsEditorVisible] = useState(false);
    const [isTerminalVisible, setIsTerminalVisible] = useState(false);

    useEffect(() => {
        if (!isTerminalVisible || !terminalRef.current) return;

        const term = new Terminal({
            fontFamily: 'monospace',
            theme: {
                background: '#1e1e1e',
                foreground: '#ffffff',
            },
        });

        term.open(terminalRef.current);
        term.write('React 19 + xterm.js ready! 🎉\r\n$ ');
        termRef.current = term;

        term.onData((input) => {
            term.write(input);
            console.log('User typed:', input);
        });

        return () => {
            term.dispose();
        };
    }, [isTerminalVisible]);

    return (
        <div className={styles.pageTest}>
<div className={styles.crowd}>
{Array.from({ length: 9 }).map((_, index) => (
  <div key={index} className={styles.avatar}>
    <UserAvatarSvg />
  </div>
))}
</div>


        </div>
    );
}