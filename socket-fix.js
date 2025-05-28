// Fix for Socket.IO connection issues
document.addEventListener('DOMContentLoaded', function() {
    // Override the connectSocket function to work in demo mode
    window.connectSocket = function() {
        console.log('Socket connection disabled in demo mode');
        
        // Create a mock socket object that doesn't actually connect
        window.socket = {
            on: function(event, callback) {
                console.log('Mock socket registered event:', event);
                return this;
            },
            emit: function(event, data) {
                console.log('Mock socket emitted event:', event, data);
                return this;
            },
            disconnect: function() {
                console.log('Mock socket disconnected');
                return this;
            }
        };
        
        // Simulate connection success
        console.log('Mock socket connected successfully');
    };
});
