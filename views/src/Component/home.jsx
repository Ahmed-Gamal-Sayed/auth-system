
export default function Home() {
    return (
        <>
            <div className='container'>
                <h1>Verification System</h1>
                <p>A Verification System is a process or tool designed to validate user identity, data integrity, or system authenticity. It ensures secure access to resources, reduces fraudulent activities, and maintains trust within an application or platform. The system can operate in various contexts, such as user account verification, document validation, or transaction authentication.</p>
                <a href='/signin' className='link'>Sign in</a>
                <a href='/signup' className='link'>Sign up</a>
            </div>
        </>
    );
}
