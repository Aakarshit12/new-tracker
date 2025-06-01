// Map deployment fixes for Netlify
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for map issues...');
    
    // Fix for Content Security Policy issues with Leaflet on deployed sites
    function fixMapCSP() {
        // Add meta tag for Content Security Policy if not present
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const metaCSP = document.createElement('meta');
            metaCSP.setAttribute('http-equiv', 'Content-Security-Policy');
            metaCSP.setAttribute('content', 
                "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval';"
            );
            document.head.appendChild(metaCSP);
            console.log('Added CSP meta tag for map resources');
        }
    }
    
    // Fix for HTTPS mixed content issues
    function fixMapProtocol() {
        // Update Leaflet URLs to ensure they use HTTPS
        const leafletCSS = document.querySelector('link[href*="leaflet.css"]');
        if (leafletCSS && leafletCSS.href.startsWith('http:')) {
            leafletCSS.href = leafletCSS.href.replace('http:', 'https:');
            console.log('Updated Leaflet CSS to HTTPS');
        }
        
        const leafletJS = document.querySelector('script[src*="leaflet.js"]');
        if (leafletJS && leafletJS.src.startsWith('http:')) {
            leafletJS.src = leafletJS.src.replace('http:', 'https:');
            console.log('Updated Leaflet JS to HTTPS');
        }
    }
    
    // Force map container visibility and size
    function fixMapContainer() {
        // Fix for customer map
        const customerMap = document.getElementById('map');
        if (customerMap) {
            customerMap.style.display = 'block';
            customerMap.style.height = '500px';
            customerMap.style.width = '100%';
            customerMap.style.visibility = 'visible';
            customerMap.style.position = 'relative';
            console.log('Fixed customer map container styles');
        }
        
        // Fix for simulator map
        const simulatorMap = document.getElementById('simulator-map');
        if (simulatorMap) {
            simulatorMap.style.display = 'block';
            simulatorMap.style.height = '400px';
            simulatorMap.style.width = '100%';
            simulatorMap.style.visibility = 'visible';
            simulatorMap.style.position = 'relative';
            console.log('Fixed simulator map container styles');
        }
    }
    
    // Fix for tile layer URLs
    function fixMapTiles() {
        // Override the initCustomerMap and initSimulatorMap functions to ensure HTTPS tile URLs
        const originalInitCustomerMap = window.initCustomerMap;
        window.initCustomerMap = function() {
            console.log('Running enhanced initCustomerMap with deployment fixes');
            
            // Call the original function
            if (typeof originalInitCustomerMap === 'function') {
                originalInitCustomerMap();
            }
            
            // Additional fixes after map initialization
            setTimeout(function() {
                if (window.map) {
                    // Force map to recalculate its container size
                    window.map.invalidateSize(true);
                    console.log('Forced map size recalculation');
                    
                    // Ensure tile layer is using HTTPS
                    window.map.eachLayer(function(layer) {
                        if (layer instanceof L.TileLayer) {
                            const url = layer.getUrl();
                            if (url && url.startsWith('http:')) {
                                window.map.removeLayer(layer);
                                L.tileLayer(url.replace('http:', 'https:'), {
                                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                }).addTo(window.map);
                                console.log('Updated tile layer to HTTPS');
                            }
                        }
                    });
                }
            }, 1000);
        };
        
        const originalInitSimulatorMap = window.initSimulatorMap;
        window.initSimulatorMap = function() {
            console.log('Running enhanced initSimulatorMap with deployment fixes');
            
            // Call the original function
            if (typeof originalInitSimulatorMap === 'function') {
                originalInitSimulatorMap();
            }
            
            // Additional fixes after map initialization
            setTimeout(function() {
                if (window.simulatorMap) {
                    // Force map to recalculate its container size
                    window.simulatorMap.invalidateSize(true);
                    console.log('Forced simulator map size recalculation');
                    
                    // Ensure tile layer is using HTTPS
                    window.simulatorMap.eachLayer(function(layer) {
                        if (layer instanceof L.TileLayer) {
                            const url = layer.getUrl();
                            if (url && url.startsWith('http:')) {
                                window.simulatorMap.removeLayer(layer);
                                L.tileLayer(url.replace('http:', 'https:'), {
                                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                }).addTo(window.simulatorMap);
                                console.log('Updated simulator tile layer to HTTPS');
                            }
                        }
                    });
                }
            }, 1000);
        };
    }
    
    // Apply all fixes
    fixMapCSP();
    fixMapProtocol();
    fixMapContainer();
    fixMapTiles();
    
    // Add a delayed check to ensure maps are properly initialized
    setTimeout(function() {
        console.log('Running delayed map initialization check');
        
        // Check if maps are initialized
        if (!window.map && document.getElementById('map')) {
            console.log('Customer map not initialized, forcing initialization');
            if (typeof window.initCustomerMap === 'function') {
                window.initCustomerMap();
            }
        }
        
        if (!window.simulatorMap && document.getElementById('simulator-map')) {
            console.log('Simulator map not initialized, forcing initialization');
            if (typeof window.initSimulatorMap === 'function') {
                window.initSimulatorMap();
            }
        }
        
        // Force map size recalculation again
        if (window.map) {
            window.map.invalidateSize(true);
        }
        
        if (window.simulatorMap) {
            window.simulatorMap.invalidateSize(true);
        }
    }, 2000);
});
