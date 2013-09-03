/*
 * webcamscan.js
 * https://github.com/rcluke/webcamscan.js
 * @returns {Boolean}
 */

(function( $ ) {
	var video, canvas, ctx, localMediaStream = null, processor;
	var options = {
		width       : '640',
		height      : '480',
		refreshRate : 1000,
		onReject : function(e) {
			console.log('User rejected media request', e);
		},
		onScan : function(e, barcode) {
			alert(barcode);
			$(this).webcamscan('stop');
		}
	};
	
	var methods = {
		init : function(userOptions) {
			$.extend( options, userOptions );
			
			if ($(this).webcamscan('isAvailable')) {
				$(this).html('<video autoplay></video><canvas style="display:none;" width="' + options.width + '" height="' + options.height + '"></canvas>');
				video = $(this).find('video')[0];
				canvas = $(this).find('canvas')[0];
				ctx = canvas.getContext('2d');
			}
		},
		scan : function() { //todo add timeout parameter
			if (localMediaStream == null) {
				// Not showing vendor prefixes or code that works cross-browser.
				navigator.webkitGetUserMedia({video: true}, function(stream) {
					video.src = window.webkitURL.createObjectURL(stream);
					localMediaStream = stream;
				}, options.onReject );
			}
			
			var barcode;
			processor = setInterval(function() {
				$('#barcodeImage')[0].src = freezeFrame();
				barcode = getBarcodeFromImage('barcodeImage');
				console.log(barcode);
				if (barcode.indexOf('X') < 0) {
					$(this).trigger('webcamscan.scanned', barcode);
				}
			}, options.refreshRate);			
		},
		stop : function() {
			localMediaStream.stop();
			clearInterval(processor);
		},
		isAvailable : function() {
			return !!(navigator.getUserMedia 
					|| navigator.webkitGetUserMedia
					|| navigator.mozGetUserMedia
					|| navigator.msGetUserMedia);			
		}
	};
	
	$(this).on('webcamscan.scanned', options.onScan);
	
	function freezeFrame() {
		if (localMediaStream) {
			ctx.drawImage(video, 0, 0);
			return canvas.toDataURL('image/webp');
		}
	}
	
	$.fn.webcamscan = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, [].slice.call(arguments, 1));
		} else {
			return methods.init.apply(this, arguments);
		}
	};
})(jQuery);