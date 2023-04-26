const request = require('request');
require('dotenv').config();
let publicIpModule;

async function main() {
	publicIpModule ??= await import('public-ip');

	let retString = '';

	function log(...args) {
		retString += args.join(' ') + '\n';
		console.log(...args);
	}

	// Get list of subdomain, domain, and zone ID from process.env.domains, split by comma, where the syntax is <subdomain>|<domain>|<zoneId>
	const domainsAndSubdomains = process.env.domains.split(',').map(str => {
		const [subdomain, domain, zoneId] = str.split('|');
		return { subdomain, domain, zoneId };
	});

	// Replace with your own Cloudflare API credentials
	const email = process.env.CLOUDFLARE_EMAIL;
	const apiKey = process.env.CLOUDFLARE_API_KEY;

	log('Getting public IP...');

	// Get the public IP address of the system
	const publicIp = await publicIpModule.publicIpv4();

	for (const { subdomain, domain, zoneId } of domainsAndSubdomains) {
		log('Processing:', subdomain, domain);
		// JS template string for ruby syntax https://api.cloudflare.com/client/v4/zones/:zone_identifier/dns_records?type=A&name=:subdomain.:domain
		let addr = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=A&name=${subdomain}.${domain}`;

		// Send a request to addr using fetch api
		let res = await fetch(addr, {
			headers: {
				'Content-Type': 'application/json',
				'X-Auth-Email': email,
				'X-Auth-Key': apiKey,
			},
		});

		// Check if response is ok
		if (!res.ok) {
			log('Error:', res.status, res.statusText);
			continue;
		}
		
		// Get results
		let json = await res.json();
		let result = json?.result[0];

		if (!result) {
			log('No result found');
			continue;
		}
		let currentIp = result.content;
		let recordId = result.id;
		let proxied = result.proxied;

		if (currentIp) {

			log('Got configured IP address');

			log(`Current IP: ${hideIP(currentIp)}`);
			log(`Public IP: ${hideIP(publicIp)}`);

			// If the current IP and public IP are the same, no update is necessary
			if (currentIp === publicIp) {
				log('No update necessary.');
				continue;
			}

			// Update the DNS record to point to the public IP, with the fetch api
			const options = {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'X-Auth-Email': email,
					'X-Auth-Key': apiKey,
				},
				body: JSON.stringify({
					type: 'A',
					name: subdomain,
					content: publicIp,
					ttl: 1,
					proxied,
				}),
			};
			const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`;

			try {
				const response = await fetch(url, options);
				if (!response.ok) {
					const error = await response.json();
					throw new Error(`Failed to update DNS record: ${error.errors[0].message}`);
				}
				const result = await response.json();
				log(result);
				log('DNS record updated.');
			} catch (error) {
				console.error(error);
			}
		}
		else console.error('No IP address found in response.');
	}
	return retString;
	
	function hideIP(ip) {
		return ip.split('.').map((part, i) => i == 0 || i == 3 ? part : '*'.repeat(part.length)).join('.');
	}
}

module.exports = main;

if (require.main === module) {
	main();
}