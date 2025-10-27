export const dataService = {
    exportAllData: () => {
        const data: { [key: string]: string } = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('blizzard_racing_')) {
                data[key] = localStorage.getItem(key) || '';
            }
        }

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blizzard_racing_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importAllData: (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonString = event.target?.result as string;
                const data = JSON.parse(jsonString);

                // Clear existing blizzard data first
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('blizzard_racing_')) {
                       keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                // Import new data
                for (const key in data) {
                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                        localStorage.setItem(key, data[key]);
                    }
                }
                
                alert('Import successful! The application will now reload.');
                window.location.reload();

            } catch (error) {
                console.error("Error importing data:", error);
                alert('Import failed. The file may be corrupted or in the wrong format.');
            }
        };
        reader.readAsText(file);
    }
};