import React from 'react';

const App = () => {
    return (
        <div>
            <header className='App-header'>
                <h1>ECU Tuning Application</h1>
                <nav>
                    <ul>
                        <li><a href='#dashboard'>Dashboard</a></li>
                        <li><a href='#tuning'>Tuning</a></li>
                        <li><a href='#logs'>Logs</a></li>
                        <li><a href='#settings'>Settings</a></li>
                    </ul>
                </nav>
            </header>
            <main>
                <h2>Main Dashboard</h2>
                <p>Welcome to the ECU tuning application!</p>
                {/* Add additional dashboard components here */}
            </main>
        </div>
    );
};

export default App;