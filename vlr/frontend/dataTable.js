document.addEventListener('DOMContentLoaded', function() {
    Papa.parse('../data/data.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data;
            const table = populateDataTable(data);
            applyGradientColors(table);
        }
    });
});

function populateDataTable(data) {
    return $('#dataTable').DataTable({
        data: data,
        pageLength: 100,
        lengthMenu: [
            [50, 100, 150, 200, -1],
            ['50', '100', '150', '200', 'Tout']
        ],
        columns: [
            { data: 'Player', defaultContent: '', applyGradient: false },
            { data: 'Team', defaultContent: '', applyGradient: false },
            { data: 'Rnd', defaultContent: '', applyGradient: false },
            { data: 'K', defaultContent: '', applyGradient: false },
            { data: 'D', defaultContent: '', applyGradient: false },
            { data: 'A', defaultContent: '', applyGradient: false },
            { data: 'FK', defaultContent: '', applyGradient: false },
            { data: 'FD', defaultContent: '', applyGradient: false },
            { data: 'CL', defaultContent: '', applyGradient: false },
            { data: 'LastAlive', defaultContent: '', applyGradient: false },
            { data: 'KMax', defaultContent: '', applyGradient: false },
            { data: 'Rating', defaultContent: '', applyGradient: true, gradientStartColor: '#ffcccc', gradientEndColor: '#ffccff' },
            { data: 'ACS', defaultContent: '', applyGradient: true, gradientStartColor: '#ffcccc', gradientEndColor: '#ffccff' },
            { data: 'ADR', defaultContent: '', applyGradient: true, gradientStartColor: '#ffcccc', gradientEndColor: '#ffccff' },
            { data: 'KAST', defaultContent: '', applyGradient: true, gradientStartColor: '#ffcccc', gradientEndColor: '#ffccff' },
            { data: 'HS%', defaultContent: '', applyGradient: true, gradientStartColor: '#ffcccc', gradientEndColor: '#ffccff' },
            { data: 'KD', defaultContent: '', applyGradient: true, gradientStartColor: '#ffcccc', gradientEndColor: '#ffccff' },
            { data: 'KDA', defaultContent: '', applyGradient: true, gradientStartColor: '#ffcccc', gradientEndColor: '#ffccff' },
            { data: 'KPR', defaultContent: '', applyGradient: true, gradientStartColor: '#ffcccc', gradientEndColor: '#ffccff' },
            { data: 'DPR', defaultContent: '', applyGradient: true, gradientStartColor: '#ffccff', gradientEndColor: '#ffcccc' },
            { data: 'APR', defaultContent: '', applyGradient: true, gradientStartColor: '#ffcccc', gradientEndColor: '#ffccff' },
            { data: 'FKPR', defaultContent: '', applyGradient: true, gradientStartColor: '#ffcccc', gradientEndColor: '#ffccff' },
            { data: 'FDPR', defaultContent: '', applyGradient: true, gradientStartColor: '#ffccff', gradientEndColor: '#ffcccc' },
            { data: 'CLPR', defaultContent: '', applyGradient: true, gradientStartColor: '#ffcccc', gradientEndColor: '#ffccff' },
            { data: 'LastAlivePR', defaultContent: '', applyGradient: true, gradientStartColor: '#ffccff', gradientEndColor: '#ffcccc' },
            { data: 'CL%', defaultContent: '', applyGradient: true, gradientStartColor: '#ffcccc', gradientEndColor: '#ffccff' },
            { data: 'BaitScore', defaultContent: '', applyGradient: true, gradientStartColor: '#ffccff', gradientEndColor: '#ffcccc' }
        ]
    });
}

function applyGradientColors(table) {
    table.rows().every(function(rowIdx) {
        const row = this.node();

        // Loop through each column
        for (let colIdx = 0; colIdx < table.columns().header().length; colIdx++) {
            const column = table.column(colIdx);
            const columnDef = table.settings().init().columns[colIdx];

            if (!columnDef.applyGradient) continue;

            const cell = table.cell(rowIdx, colIdx).node();
            const value = table.cell(rowIdx, colIdx).data();

            // Get all data for the column
            const columnData = column.data().toArray();

            // Filter out non-numeric values
            const numericData = columnData.filter(val => !isNaN(parseFloat(val))).map(val => parseFloat(val));

            if (numericData.length === 0) continue;

            // Find min and max values for the column
            const minValue = Math.min(...numericData);
            const maxValue = Math.max(...numericData);

            // Calculate the relative position of the current cell's value
            const currentValue = parseFloat(value);
            if (isNaN(currentValue)) continue;

            const relativePosition = (currentValue - minValue) / (maxValue - minValue);

            // Convert hex colors to HSL
            const startHSL = hexToHSL(columnDef.gradientStartColor);
            const endHSL = hexToHSL(columnDef.gradientEndColor);

            // Interpolate between start and end HSL values
            const hue = startHSL.h + (endHSL.h - startHSL.h) * relativePosition;
            const saturation = startHSL.s + (endHSL.s - startHSL.s) * relativePosition;
            const lightness = startHSL.l + (endHSL.l - startHSL.l) * relativePosition;

            // Apply gradient color based on the relative position
            $(cell).css('background-color', 'hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%)');
        }
    });
}

// Helper function to convert hex color to HSL
function hexToHSL(hex) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }

    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}



