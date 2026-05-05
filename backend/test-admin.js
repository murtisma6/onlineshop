async function run() {
    try {
        const adminRes = await fetch('http://localhost:8080/api/auth/make-admin/3', {
            method: 'POST'
        });
        const adminData = await adminRes.json();
        console.log("Made admin:", adminData);
    } catch (e) {
        console.log("Error:", e);
    }
}
run();
