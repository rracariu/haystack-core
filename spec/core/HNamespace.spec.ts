/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { HNamespace, Reflection } from '../../src/core/HNamespace'
import { HGrid } from '../../src/core/HGrid'
import { HDict } from '../../src/core/HDict'
import { HSymbol } from '../../src/core/HSymbol'
import { ZincReader } from '../../src/core/ZincReader'
import { HRef } from '../../src/core/HRef'
import { HStr } from '../../src/core/HStr'
import { HList } from '../../src/core/HList'
import { HMarker } from '../../src/core/HMarker'
import { HNum } from '../../src/core/HNum'
import { Kind } from '../../src/core/Kind'
import { TrioReader } from '../../src/core/TrioReader'
import '../../src/core/Array'
import { readFile } from './file'
import '../matchers'
import '../customMatchers'

describe('HNamespace', function (): void {
	let defs: HNamespace
	let grid: HGrid
	let zinc: string

	beforeAll(function (): void {
		zinc = readFile('./defsWithFeatures.zinc')
	})

	beforeEach(function (): void {
		grid = ZincReader.readValue(zinc) as HGrid

		defs = new HNamespace(grid)
	})

	describe('.defaultNamespace', function (): void {
		afterEach(function (): void {
			HNamespace.defaultNamespace = new HNamespace(HGrid.make({}))
		})

		it('returns a default empty namespace', function (): void {
			expect(HNamespace.defaultNamespace.grid.length).toBe(0)
		})

		it('sets a default namespace', function (): void {
			HNamespace.defaultNamespace = defs
			expect(HNamespace.defaultNamespace.grid).toBe(defs.grid)
		})
	}) // .defaultNamespace

	describe('#byName()', function (): void {
		it('returns a def using a name', function (): void {
			expect(defs.byName('ahu') instanceof HDict).toBe(true)
		})

		it('returns a def using a symbol', function (): void {
			expect(defs.byName(HSymbol.make('ahu')) instanceof HDict).toBe(true)
		})

		it('returns undefined when the def is not found', function (): void {
			expect(defs.byName('foobar')).toBeUndefined()
		})
	}) // #byName()

	describe('#get()', function (): void {
		it('returns a def using a name', function (): void {
			expect(defs.get('ahu') instanceof HDict).toBe(true)
		})

		it('returns a def using a symbol', function (): void {
			expect(defs.get(HSymbol.make('ahu')) instanceof HDict).toBe(true)
		})

		it('returns undefined when the def is not found', function (): void {
			expect(defs.get('foobar')).toBeUndefined()
		})
	}) // #get()

	describe('#byAllNames()', function (): void {
		it('return an array of defs via the names', function (): void {
			expect(defs.byAllNames('ahu', 'site')).toEqual(
				defs.byAllNames('ahu', 'site')
			)
		})

		it('return an array of defs via the names as symbols', function (): void {
			expect(
				defs.byAllNames(HSymbol.make('ahu'), HSymbol.make('site'))
			).toEqual(defs.byAllNames('ahu', 'site'))
		})

		it('return an array of defs via an array of names', function (): void {
			expect(defs.byAllNames(['ahu', 'site'])).toEqual(
				defs.byAllNames('ahu', 'site')
			)
		})

		it('return an array of defs via an array of names as symbols', function (): void {
			expect(
				defs.byAllNames([HSymbol.make('ahu'), HSymbol.make('site')])
			).toEqual(defs.byAllNames('ahu', 'site'))
		})

		it('throws an error when a def cannot be found', function (): void {
			expect((): void => {
				defs.byAllNames('foobar')
			}).toThrow()
		})
	}) // #byAllNames()

	describe('#hasName()', function (): void {
		it('returns true if the def exists', function (): void {
			expect(defs.hasName('ahu')).toBe(true)
		})

		it('returns true if the def exists via a symbol', function (): void {
			expect(defs.hasName(HSymbol.make('ahu'))).toBe(true)
		})

		it('returns false if the def does not exist', function (): void {
			expect(defs.hasName('foobar')).toBe(false)
		})
	}) // #hasName()

	describe('#has()', function (): void {
		it('returns true if the def exists', function (): void {
			expect(defs.has('ahu')).toBe(true)
		})

		it('returns true if the def exists via a symbol', function (): void {
			expect(defs.has(HSymbol.make('ahu'))).toBe(true)
		})

		it('returns false if the def does not exist', function (): void {
			expect(defs.has('foobar')).toBe(false)
		})
	}) // #has()

	describe('#conjuncts', function (): void {
		it('returns an array of conjunct defs', function (): void {
			const conjuncts = defs.conjuncts

			expect(conjuncts.length).toBeGreaterThan(0)

			for (const def of conjuncts) {
				const name = String(def.get('def'))
				expect(name.indexOf('-')).toBeGreaterThan(-1)
			}
		})
	}) // #conjuncts

	describe('.isConjunct()', function (): void {
		it('returns true if the name is a conjunct', function (): void {
			expect(HNamespace.isConjunct('hot-water')).toBe(true)
		})

		it('returns true if the name as a symbol is a conjunct', function (): void {
			expect(HNamespace.isConjunct(HSymbol.make('hot-water'))).toBe(true)
		})

		it('returns false if the name is not a conjunct', function (): void {
			expect(HNamespace.isConjunct('water')).toBe(false)
		})

		it('returns false if the name as a symbol is not a conjunct', function (): void {
			expect(HNamespace.isConjunct(HSymbol.make('water'))).toBe(false)
		})
	}) // .isConjunct()

	describe('.splitConjunct()', function (): void {
		it('split a conjunct into its names for a string', function (): void {
			expect(HNamespace.splitConjunct('hot-water')).toEqual([
				'hot',
				'water',
			])
		})

		it('split a conjunct into its names for a symbol', function (): void {
			expect(
				HNamespace.splitConjunct(HSymbol.make('hot-water'))
			).toEqual(['hot', 'water'])
		})
	}) // .splitConjunct()

	describe('#conjunctDefs()', function (): void {
		it('returns a conjuncts defs', function (): void {
			expect(defs.conjunctDefs('hot-water')).toEqual(
				defs.byAllNames('hot', 'water')
			)
		})

		it('throws an error if the conjunct contains an invalid def', function (): void {
			expect((): void => {
				defs.conjunctDefs('hot-potato')
			}).toThrow()
		})
	}) // #conjunctDefs()

	describe('#features', function (): void {
		it('returns an array of features defs', function (): void {
			const features = defs.features

			expect(features.length).toBeGreaterThan(0)

			for (const def of features) {
				const name = String(def.get('def'))
				expect(name.indexOf(':')).toBeGreaterThan(-1)
			}
		})
	}) // #features

	describe('.isFeature()', function (): void {
		it('returns true if the name is a feature', function (): void {
			expect(HNamespace.isFeature('feature:key')).toBe(true)
		})

		it('returns true if the name is a feature', function (): void {
			expect(HNamespace.isFeature(HSymbol.make('feature:key'))).toBe(true)
		})

		it('returns false if the name is not a feature', function (): void {
			expect(HNamespace.isFeature(HSymbol.make('water'))).toBe(false)
		})
	}) // .isFeature()

	describe('#libs', function (): void {
		it('returns a list of lib defs', function (): void {
			expect(defs.libs).toEqual(
				defs.byAllNames([
					'ext',
					'lib:alert',
					'lib:api',
					'lib:brand',
					'lib:cluster',
					'lib:conn',
					'lib:core',
					'lib:crypto',
					'lib:debug',
					'lib:demo',
					'lib:dev',
					'lib:diag',
					'lib:doc',
					'lib:email',
					'lib:energy',
					'lib:equip',
					'lib:geo',
					'lib:haystack',
					'lib:his',
					'lib:hisKit',
					'lib:host',
					'lib:http',
					'lib:hvac',
					'lib:install',
					'lib:io',
					'lib:iot',
					'lib:job',
					'lib:legacy',
					'lib:lic',
					'lib:lighting',
					'lib:lint',
					'lib:log',
					'lib:math',
					'lib:mobile',
					'lib:nav',
					'lib:ph',
					'lib:phIct',
					'lib:phIoT',
					'lib:phScience',
					'lib:pod',
					'lib:point',
					'lib:proj',
					'lib:pub',
					'lib:repl',
					'lib:rule',
					'lib:schedule',
					'lib:session',
					'lib:tariff',
					'lib:ui',
					'lib:ui2',
					'lib:user',
					'lib:viz',
					'lib:watchdog',
					'lib:weather',
					'lib:xquery',
					'sysMod',
				])
			)
		})
	}) // #libs

	describe('#subTypesOf()', function (): void {
		it('returns the subtypes of a def using a name', function (): void {
			expect(defs.subTypesOf('liquid')).toEqual(
				defs.byAllNames('condensate', 'fuelOil', 'gasoline', 'water')
			)
		})

		it('returns the subtypes of a def using a symbol', function (): void {
			expect(defs.subTypesOf(HSymbol.make('liquid'))).toEqual(
				defs.byAllNames('condensate', 'fuelOil', 'gasoline', 'water')
			)
		})

		it('returns an empty array when there are no subtypes using a name', function (): void {
			expect(defs.subTypesOf('blowdown-water')).toEqual([])
		})

		it('returns an empty array when there are no subtypes using a symbols', function (): void {
			expect(defs.subTypesOf(HSymbol.make('blowdown-water'))).toEqual([])
		})

		it('returns an empty array for an invalid def using a name', function (): void {
			expect(defs.subTypesOf('foobar')).toEqual([])
		})

		it('returns an empty array for an invalid def using a symbol', function (): void {
			expect(defs.subTypesOf(HSymbol.make('foobar'))).toEqual([])
		})
	}) // #subTypesOf()

	describe('#allSubTypesOf()', function (): void {
		it('returns the subtypes of `point`', function (): void {
			expect(defs.allSubTypesOf('point')).toEqual(
				defs.byAllNames(
					'connPoint',
					'haystackPoint',
					'cur-point',
					'his-point',
					'weather-point',
					'writable-point'
				)
			)
		})
	}) // #allSubTypesOf()

	describe('#hasSubType()', function (): void {
		it('returns true if a def has a subtype for a name', function (): void {
			expect(defs.hasSubTypes('liquid')).toBe(true)
		})

		it('returns true if a def has a subtype for a symbol', function (): void {
			expect(defs.hasSubTypes(HSymbol.make('liquid'))).toBe(true)
		})

		it('returns false if a def does not have a subtype for a name', function (): void {
			expect(defs.hasSubTypes('hot-water')).toBe(false)
		})

		it('returns false if a def does not have a subtype for a symbol', function (): void {
			expect(defs.hasSubTypes(HSymbol.make('hot-water'))).toBe(false)
		})

		it('returns false if the def does not exist for a name', function (): void {
			expect(defs.hasSubTypes('foobar')).toBe(false)
		})

		it('returns false if the def does not exist for a name', function (): void {
			expect(defs.hasSubTypes(HSymbol.make('foobar'))).toBe(false)
		})
	}) // #hasSubType()

	describe('#superTypesOf()', function (): void {
		it('returns an array of supertypes using a name', function (): void {
			expect(defs.superTypesOf('site')).toEqual(
				defs.byAllNames('entity', 'geoPlace')
			)
		})

		it('returns an array of supertypes using a symbol', function (): void {
			expect(defs.superTypesOf('site')).toEqual(
				defs.byAllNames(
					HSymbol.make('entity'),
					HSymbol.make('geoPlace')
				)
			)
		})
	}) // #superTypesOf()

	describe('#allSuperTypesOf()', function (): void {
		it('returns an flattened array of supertypes using a name', function (): void {
			expect(defs.allSuperTypesOf('site')).toEqual(
				defs.byAllNames('entity', 'marker', 'geoPlace')
			)
		})

		it('returns an flattened array of supertypes using a symbol', function (): void {
			expect(defs.allSuperTypesOf(HSymbol.make('site'))).toEqual(
				defs.byAllNames('entity', 'marker', 'geoPlace')
			)
		})
	}) // #allSuperTypesOf()

	describe('#choicesFor()', function (): void {
		it('returns the choices for a def using a name', function (): void {
			expect(defs.choicesFor('ductSection')).toEqual(
				defs.byAllNames(
					'discharge',
					'exhaust',
					'flue',
					'inlet',
					'mixed',
					'outside',
					'return'
				)
			)
		})

		it('returns the choices for a def using a symbol', function (): void {
			expect(defs.choicesFor(HSymbol.make('ductSection'))).toEqual(
				defs.byAllNames(
					'discharge',
					'exhaust',
					'flue',
					'inlet',
					'mixed',
					'outside',
					'return'
				)
			)
		})

		it('returns an empty array when there are no choices using a name', function (): void {
			expect(defs.choicesFor('exhaust')).toEqual([])
		})

		it('returns an empty array when there are no choices using a symbol', function (): void {
			expect(defs.choicesFor(HSymbol.make('exhaust'))).toEqual([])
		})

		it('returns an empty array when the def is invalid using a name', function (): void {
			expect(defs.choicesFor('foobar')).toEqual([])
		})

		it('returns an empty array when the def is invalid using a symbol', function (): void {
			expect(defs.choicesFor(HSymbol.make('foobar'))).toEqual([])
		})
	}) // #choicesFor()

	describe('#choices', function (): void {
		it('returns all the choices in the namespace', function (): void {
			expect(Object.keys(defs.choices)).toEqual([
				'ahuRef',
				'ahuZoneDelivery',
				'association',
				'calendarRef',
				'childrenFlatten',
				'chilledWaterPlantRef',
				'chillerMechanism',
				'connTuningRef',
				'conveys',
				'coolingProcess',
				'cools',
				'dehumidifies',
				'depends',
				'ductConfig',
				'ductDeck',
				'ductSection',
				'equipFunction',
				'equipRef',
				'haystackConnRef',
				'heatingProcess',
				'heats',
				'hotWaterPlantRef',
				'humidifies',
				'is',
				'linter',
				'meterScope',
				'moves',
				'pipeSection',
				'pointFunction',
				'pointQuantity',
				'pointSubject',
				'prefUnit',
				'processUses',
				'produces',
				'quantities',
				'quantityOf',
				'regulates',
				'reheats',
				'ruleType',
				'scheduleRef',
				'siteRef',
				'spaceRef',
				'steamPlantRef',
				'stores',
				'submeterOf',
				'tagOn',
				'tags',
				'traitOn',
				'vavAirCircuit',
				'vavModulation',
				'ventilates',
				'weatherRef',
			])
		})
	}) // #choices

	describe('#featureNames', function (): void {
		it('returns the feature names', function (): void {
			expect(defs.featureNames).toEqual([
				'app',
				'filetype',
				'func',
				'lib',
				'template',
				'view',
				'typeScript',
				'trait',
				'traitView',
			])
		})
	}) // #featureNames

	describe('#tagOnNames', function (): void {
		it('returns the feature names', function (): void {
			expect(defs.tagOnNames).toEqual([
				'conn',
				'func',
				'view',
				'site',
				'space',
				'lib',
				'connPoint',
				'chiller',
				'point',
				'cur-point',
				'entity',
				'equip',
				'def',
				'projMeta',
				'controller',
				'filetype',
				'floor',
				'geoPlace',
				'haystackPoint',
				'haystackConn',
				'rule',
				'his-point',
				'filetype:svg',
				'filetype:pdf',
				'energyStarConn',
				'obixConn',
				'sedonaConn',
				'snmpConn',
				'sqlConn',
				'connTuning',
				'meter',
				'weatherStation',
				'bacnetConn',
				'modbusConn',
				'opcConn',
				'provBuild',
				'provImage',
				'provOverlay',
				'provPatch',
				'motor',
				'weather-point',
				'writable-point',
				'trait:point',
			])
		})
	}) // #tagOnNames

	describe('#tagOnIndices', function (): void {
		it('returns a list of names to tagOn defs', function (): void {
			expect(Object.keys(defs.tagOnIndices)).toEqual([
				'actorTimeout',
				'admin',
				'area',
				'baseUri',
				'connErr',
				'connLinger',
				'connPingFreq',
				'connState',
				'connStatus',
				'connTuningRef',
				'coolingCapacity',
				'cur',
				'curCalibration',
				'curConvert',
				'curErr',
				'curStatus',
				'curVal',
				'depends',
				'dis',
				'disMacro',
				'doc',
				'enum',
				'equipRef',
				'fileExt',
				'floorNum',
				'geoAddr',
				'geoCity',
				'geoCoord',
				'geoCountry',
				'geoCounty',
				'geoElevation',
				'geoPostalCode',
				'geoState',
				'geoStreet',
				'haystackConnRef',
				'haystackCur',
				'haystackHis',
				'haystackPollFreq',
				'haystackWrite',
				'haystackWriteLevel',
				'help',
				'his',
				'hisAppendNA',
				'hisCollectCov',
				'hisCollectInterval',
				'hisCollectWriteFreq',
				'hisConvert',
				'hisEnd',
				'hisErr',
				'hisMode',
				'hisSize',
				'hisStart',
				'hisStatus',
				'hisTotalized',
				'id',
				'imageSize',
				'is',
				'kind',
				'mandatory',
				'maxVal',
				'mime',
				'minVal',
				'navName',
				'notInherited',
				'of',
				'pageSize',
				'password',
				'pollTime',
				'primaryFunction',
				'ruleOn',
				'siteRef',
				'spaceRef',
				'staleTime',
				'su',
				'submeterOf',
				'tagOn',
				'transient',
				'tz',
				'unit',
				'uri',
				'username',
				'version',
				'vfd',
				'weatherRef',
				'wikipedia',
				'writable',
				'writeConvert',
				'writeErr',
				'writeLevel',
				'writeMaxTime',
				'writeMinTime',
				'writeStatus',
				'writeVal',
				'yearBuilt',
				'traitView:point',
			])
		})
	}) // #tagOnIndices

	describe('#inheritance()', function (): void {
		it("returns a def's inheritance using a name", function (): void {
			expect(defs.inheritance('site')).toEqual(
				defs.byAllNames(['site', 'entity', 'marker', 'geoPlace'])
			)
		})

		it("returns a def's inheritance using a symbol", function (): void {
			expect(defs.inheritance(HSymbol.make('site'))).toEqual(
				defs.byAllNames(['site', 'entity', 'marker', 'geoPlace'])
			)
		})

		it('returns an empty array for an invalid def using a name', function (): void {
			expect(defs.inheritance('foobar')).toEqual([])
		})

		it('returns an empty array for an invalid def using a symbol', function (): void {
			expect(defs.inheritance(HSymbol.make('foobar'))).toEqual([])
		})
	}) // #inheritance()

	describe('#associations()', function (): void {
		it('returns the associations for a equipRef using names', function (): void {
			expect(defs.associations('equipRef', 'tagOn')).toEqual(
				defs.byAllNames('controller', 'equip', 'point')
			)
		})

		it('returns the associations for a equipRef using symbols', function (): void {
			expect(
				defs.associations(
					HSymbol.make('equipRef'),
					HSymbol.make('tagOn')
				)
			).toEqual(defs.byAllNames('controller', 'equip', 'point'))
		})

		it('returns an empty array for an invalid parent using names', function (): void {
			expect(defs.associations('foobar', 'tagOn')).toEqual([])
		})

		it('returns an empty array for an invalid parent using symbols', function (): void {
			expect(
				defs.associations(HSymbol.make('foobar'), HSymbol.make('tagOn'))
			).toEqual([])
		})

		it('returns the associations for a site using names', function (): void {
			expect(defs.associations('site', 'tags')).toEqual(
				defs.byAllNames(
					'area',
					'dis',
					'geoAddr',
					'geoCity',
					'geoCoord',
					'geoCountry',
					'geoCounty',
					'geoElevation',
					'geoPostalCode',
					'geoState',
					'geoStreet',
					'id',
					'primaryFunction',
					'tz',
					'weatherRef',
					'yearBuilt'
				)
			)
		})
	}) // #associations()

	describe('#tags()', function (): void {
		it('returns the associations for a site', function (): void {
			expect(defs.tags('site')).toEqual(
				defs.byAllNames(
					'area',
					'dis',
					'geoAddr',
					'geoCity',
					'geoCoord',
					'geoCountry',
					'geoCounty',
					'geoElevation',
					'geoPostalCode',
					'geoState',
					'geoStreet',
					'id',
					'primaryFunction',
					'tz',
					'weatherRef',
					'yearBuilt'
				)
			)
		})
	}) // #tags()

	describe('#is()', function (): void {
		it('returns the `is` associations for a ac-elec', function (): void {
			expect(defs.is('ac-elec')).toEqual(defs.byAllNames('elec'))
		})
	}) // #is()

	describe('#tagOn()', function (): void {
		it('returns the `tagOn` associations for a equipRef', function (): void {
			expect(defs.tagOn('equipRef')).toEqual(
				defs.byAllNames('controller', 'equip', 'point')
			)
		})
	}) // #tagOn()

	describe('#reflect()', function (): void {
		describe('Reflection', function (): void {
			let subject: HDict
			let result: Reflection

			beforeEach(function (): void {
				// Take from reflection example https://project-haystack.dev/doc/docHaystack/Reflection
				subject = HDict.make({
					id: HRef.make('hwp'),
					dis: HStr.make('Hot Water Plant'),
					hot: HMarker.make(),
					water: HMarker.make(),
					plant: HMarker.make(),
					equip: HMarker.make(),
				})

				result = defs.reflect(subject)
			})

			describe('#defs', function (): void {
				it('computes the defs the subject implements', function (): void {
					expect(result.defs).toEqual(
						defs.byAllNames(
							'id',
							'ref',
							'scalar',
							'val',
							'dis',
							'str',
							'hot',
							'marker',
							'water',
							'liquid',
							'fluid',
							'substance',
							'phenomenon',
							'plant',
							'equip',
							'entity',
							'hot-water',
							'hot-water-plant'
						)
					)
				})

				it('computes the `chilled-water` def from a dict with `chilled` and `water` marker tags', function (): void {
					const res = defs.reflect(
						HDict.make({
							chilled: HMarker.make(),
							water: HMarker.make(),
						})
					)

					expect(res.defs).toEqual(
						defs.byAllNames(
							'chilled',
							'marker',
							'water',
							'liquid',
							'fluid',
							'substance',
							'phenomenon',
							'chilled-water'
						)
					)
				})

				it('computes the `chilled-water` def from a dict with `water` and `chilled` marker tags', function (): void {
					const res = defs.reflect(
						HDict.make({
							water: HMarker.make(),
							chilled: HMarker.make(),
						})
					)

					expect(res.defs).toEqual(
						defs.byAllNames(
							'water',
							'liquid',
							'fluid',
							'substance',
							'phenomenon',
							'marker',
							'chilled',
							'chilled-water'
						)
					)
				})

				it('computes the correct conjucts of point', function (): void {
					const res = defs.reflect(
						HDict.make({
							weather: HMarker.make(),
							writable: HMarker.make(),
							cur: HMarker.make(),
							point: HMarker.make(),
							his: HMarker.make(),
							curVal: HNum.make(90),
							sensor: HMarker.make(),
							temp: HMarker.make(),
							discharge: HMarker.make(),
							air: HMarker.make(),
						})
					)
					expect(res.defs.map((d) => d.defName)).toEqual(
						expect.arrayContaining([
							'point',
							'cur-point',
							'his-point',
							'weather-point',
							'writable-point',
						])
					)
				})
			}) // #defs

			describe('#subject', function (): void {
				it('returns the original subject', function (): void {
					expect(result.subject).toBe(subject)
				})
			}) // #subject

			describe('#namespace', function (): void {
				it('returns the original namespace', function (): void {
					expect(result.namespace).toBe(defs)
				})
			}) // #namespace

			describe('#fits()', function (): void {
				it('returns true if the result fits the base', function (): void {
					expect(result.fits('equip')).toBe(true)
				})

				it('returns false if the result does not fit the base', function (): void {
					expect(result.fits('site')).toBe(false)
				})
			}) // #fits()

			describe('#toGrid()', function (): void {
				it('returns a grid from the result', function (): void {
					expect(result.toGrid().toJSON()).toEqual(
						HGrid.make({ rows: result.defs as HDict[] }).toJSON()
					)
				})
			}) // #toGrid()

			describe('#type', function (): void {
				it('returns the site marker type', function (): void {
					expect(result.type).toBe(defs.byName('plant'))
				})
			}) // #type
		}) // Reflection
	}) // #reflect()

	describe('#defOfDict()', function (): void {
		it('returns the site marker type', function (): void {
			const subject = HDict.make({
				geoAddr: HMarker.make(),
				site: HMarker.make(),
				id: HMarker.make(),
			})

			expect(defs.defOfDict(subject)).toBe(defs.byName('site'))
		})

		it('falls back to `dict` if an entity marker type cannot be found', function (): void {
			const subject = HDict.make({
				geoAddr: HMarker.make(),
				id: HMarker.make(),
			})

			expect(defs.defOfDict(subject)).toBe(defs.byName('dict'))
		})
	}) // #defOfDict()

	describe('#fits()', function (): void {
		it('returns true when site fits entity using a name', function (): void {
			expect(defs.fits('site', 'entity')).toBe(true)
		})

		it('returns true when a site fits marker using a name', function (): void {
			expect(defs.fits('site', 'marker')).toBe(true)
		})

		it('returns false when water does not fit entity using a name', function (): void {
			expect(defs.fits('water', 'entity')).toBe(false)
		})

		it('returns false when the def does not exist using a name', function (): void {
			expect(defs.fits('foobar', 'entity')).toBe(false)
		})

		it('returns false when the base does not exist using a name', function (): void {
			expect(defs.fits('site', 'foobar')).toBe(false)
		})

		it('returns true when site fits entity using a symbol', function (): void {
			expect(
				defs.fits(HSymbol.make('site'), HSymbol.make('entity'))
			).toBe(true)
		})

		it('returns true when a site fits marker using a symbol', function (): void {
			expect(
				defs.fits(HSymbol.make('site'), HSymbol.make('marker'))
			).toBe(true)
		})

		it('returns false when water does not fit entity using a symbol', function (): void {
			expect(
				defs.fits(HSymbol.make('water'), HSymbol.make('entity'))
			).toBe(false)
		})

		it('returns false when the def does not exist using a symbol', function (): void {
			expect(
				defs.fits(HSymbol.make('foobar'), HSymbol.make('entity'))
			).toBe(false)
		})

		it('returns false when the base does not exist using a symbol', function (): void {
			expect(
				defs.fits(HSymbol.make('site'), HSymbol.make('foobar'))
			).toBe(false)
		})
	}) // #fits()

	describe('#fitsMarker()', function (): void {
		it('returns true for site using a name', function (): void {
			expect(defs.fitsMarker('site')).toBe(true)
		})

		it('returns true for site using a symbol', function (): void {
			expect(defs.fitsMarker(HSymbol.make('site'))).toBe(true)
		})

		it('returns false for def using a name', function (): void {
			expect(defs.fitsMarker('def')).toBe(false)
		})

		it('returns false for def using a symbol', function (): void {
			expect(defs.fitsMarker(HSymbol.make('def'))).toBe(false)
		})
	}) // #fitsMarker()

	describe('#fitsVal()', function (): void {
		it('returns true for def using a name', function (): void {
			expect(defs.fitsVal('def')).toBe(true)
		})

		it('returns true for def using a symbol', function (): void {
			expect(defs.fitsVal(HSymbol.make('def'))).toBe(true)
		})

		it('returns false for site using a name', function (): void {
			expect(defs.fitsVal('site')).toBe(false)
		})

		it('returns false for site using a symbol', function (): void {
			expect(defs.fitsVal(HSymbol.make('site'))).toBe(false)
		})
	}) // #fitsVal()

	describe('#fitsChoice()', function (): void {
		it('returns true for ductSection using a name', function (): void {
			expect(defs.fitsChoice('ductSection')).toBe(true)
		})

		it('returns true for ductSection using a symbol', function (): void {
			expect(defs.fitsChoice(HSymbol.make('ductSection'))).toBe(true)
		})

		it('returns false for site using a name', function (): void {
			expect(defs.fitsChoice('site')).toBe(false)
		})

		it('returns false for site using a symbol', function (): void {
			expect(defs.fitsChoice(HSymbol.make('site'))).toBe(false)
		})
	}) // #fitsChoice()

	describe('#fitsEntity()', function (): void {
		it('returns true for site using a name', function (): void {
			expect(defs.fitsEntity('site')).toBe(true)
		})

		it('returns true for site using a symbol', function (): void {
			expect(defs.fitsEntity(HSymbol.make('site'))).toBe(true)
		})

		it('returns false for ductSection using a name', function (): void {
			expect(defs.fitsEntity('ductSection')).toBe(false)
		})

		it('returns false for ductSection using a symbol', function (): void {
			expect(defs.fitsEntity(HSymbol.make('ductSection'))).toBe(false)
		})
	}) // #fitsEntity()

	describe('#implementation()', function (): void {
		it('returns the implementation for a `tank`', function (): void {
			expect(defs.implementation('tank')).toEqual(
				defs.byAllNames('tank', 'equip')
			)
		})

		it('returns the implementation for a `hot-water`', function (): void {
			expect(defs.implementation('hot-water')).toEqual(
				defs.byAllNames('hot', 'water')
			)
		})

		it('throws an error if the def is invalid', function (): void {
			expect((): void => {
				defs.implementation('potato')
			}).toThrow()
		})
	}) // #implementation()

	describe('#defToKind()', function (): void {
		it('returns dict kind for `dict`', function (): void {
			expect(defs.defToKind('dict')).toBe(Kind.Dict)
		})

		it('returns grid kind for `grid`', function (): void {
			expect(defs.defToKind('grid')).toBe(Kind.Grid)
		})

		it('returns list kind for `is`', function (): void {
			expect(defs.defToKind('is')).toBe(Kind.List)
		})

		it('returns bool kind for `bool`', function (): void {
			expect(defs.defToKind('bool')).toBe(Kind.Bool)
		})

		it('returns coord kind for `geoCoord`', function (): void {
			expect(defs.defToKind('geoCoord')).toBe(Kind.Coord)
		})

		it('returns undefined kind for `curVal`', function (): void {
			expect(defs.defToKind('curVal')).toBeUndefined()
		})

		it('returns date kind for `date`', function (): void {
			expect(defs.defToKind('date')).toBe(Kind.Date)
		})

		it('returns date time kind for `dateTime`', function (): void {
			expect(defs.defToKind('dateTime')).toBe(Kind.DateTime)
		})

		it('returns na kind for `na`', function (): void {
			expect(defs.defToKind('na')).toBe(Kind.NA)
		})

		it('returns number kind for `area`', function (): void {
			expect(defs.defToKind('area')).toBe(Kind.Number)
		})

		it('returns ref kind for `ahuRef`', function (): void {
			expect(defs.defToKind('ahuRef')).toBe(Kind.Ref)
		})

		it('returns string kind for `curStatus`', function (): void {
			expect(defs.defToKind('curStatus')).toBe(Kind.Str)
		})

		it('returns symbol kind for `ductDeck`', function (): void {
			expect(defs.defToKind('ductDeck')).toBe(Kind.Symbol)
		})

		it('returns time kind for `time`', function (): void {
			expect(defs.defToKind('time')).toBe(Kind.Time)
		})

		it('returns uri kind for `baseUri`', function (): void {
			expect(defs.defToKind('baseUri')).toBe(Kind.Uri)
		})

		it('returns undefined kind for `writeVal`', function (): void {
			expect(defs.defToKind('writeVal')).toBeUndefined()
		})

		it('returns xstr kind for `xstr`', function (): void {
			expect(defs.defToKind('xstr')).toBe(Kind.XStr)
		})
	}) // #defToKind()

	describe('protos', function (): void {
		function makeDicts(zinc: string[]): HList<HDict> {
			return zinc
				.map((z: string): HDict => ZincReader.readValue(z) as HDict)
				.toList() as HList<HDict>
		}

		// function printZinc(list: HList<HDict>): HList<HDict> {
		// 	console.log(list.map((dict: HDict): string => dict.toZinc()))
		// 	return list
		// }

		describe('#protos()', function (): void {
			it('returns a list of children for pipe and equip', function (): void {
				const parent = HDict.make({
					pipe: HMarker.make(),
					equip: HMarker.make(),
				})

				const children = [
					'{pump motor equip}',
					'{valve actuator equip}',
					'{flow point}',
					'{pressure point}',
					'{temp point}',
					'{equip}',
					'{point}',
				]

				expect(defs.protos(parent).toList()).toValEqual(
					makeDicts(children)
				)
			})

			it('returns a list of children for steam, leaving, pipe and equip', function (): void {
				const parent = HDict.make({
					steam: HMarker.make(),
					leaving: HMarker.make(),
					pipe: HMarker.make(),
					equip: HMarker.make(),
				})

				const children = [
					'{steam leaving pump motor equip}',
					'{steam leaving valve actuator equip}',
					'{steam leaving flow point}',
					'{steam leaving pressure point}',
					'{steam leaving temp point}',
					'{equip}',
					'{point}',
				]

				expect(defs.protos(parent).toList()).toValEqual(
					makeDicts(children)
				)
			})

			it('returns a list of children for leaving, naturalGas, pipe and equip', function (): void {
				const parent = HDict.make({
					leaving: HMarker.make(),
					naturalGas: HMarker.make(),
					pipe: HMarker.make(),
					equip: HMarker.make(),
				})

				const children = [
					'{naturalGas leaving pump motor equip}',
					'{naturalGas leaving valve actuator equip}',
					'{naturalGas leaving flow point}',
					'{naturalGas leaving pressure point}',
					'{naturalGas leaving temp point}',
					'{equip}',
					'{point}',
				]

				expect(defs.protos(parent).toList()).toValEqual(
					makeDicts(children)
				)
			})

			it('returns a list of children for ahu', function (): void {
				const parent = HDict.make({
					ahu: HMarker.make(),
				})

				const children = [
					'{equip thermostat}',
					'{discharge duct equip}',
					'{duct equip exhaust}',
					'{duct equip mixed}',
					'{duct equip outside}',
					'{duct equip return}',
					'{freezeStat point sensor}',
					'{cmd heatWheel point}',
					'{cmd faceBypass point}',
					'{bypass cmd damper point}',
				]

				expect(defs.protos(parent).toList()).toValEqual(
					makeDicts(children)
				)
			})

			it('returns a list of children for chiller', function (): void {
				const parent = HDict.make({
					chiller: HMarker.make(),
				})

				const children = [
					'{point run state}',
					'{enable point state}',
					'{cmd load point}',
					'{load point sensor}',
					'{efficiency point sensor}',
					'{chilled equip leaving pipe water}',
					'{chilled entering equip pipe water}',
					'{chilled delta point sensor temp water}',
					'{chilled delta flow point sensor water}',
					'{chilled cmd isolation point valve water}',
					'{condenser equip leaving pipe water}',
					'{condenser entering equip pipe water}',
					'{cmd condenser isolation point valve water}',
					'{condenser point run state}',
					'{condenser point refrig sensor temp}',
					'{condenser point pressure refrig sensor}',
					'{evaporator point refrig sensor temp}',
					'{evaporator point pressure refrig sensor}',
				]

				expect(defs.protos(parent).toList()).toValEqual(
					makeDicts(children)
				)
			})

			it('returns a list of children for chiller and ahu', function (): void {
				const parent = HDict.make({
					ahu: HMarker.make(),
					chiller: HMarker.make(),
				})

				const children = [
					'{equip thermostat}',
					'{discharge duct equip }',
					'{duct equip exhaust }',
					'{duct equip mixed }',
					'{duct equip outside}',
					'{duct equip return}',
					'{freezeStat point sensor}',
					'{cmd heatWheel point}',
					'{cmd faceBypass point}',
					'{bypass cmd damper point}',
					'{point run state}',
					'{enable point state}',
					'{cmd load point}',
					'{load point sensor}',
					'{efficiency point sensor}',
					'{chilled equip leaving pipe water}',
					'{chilled entering equip pipe water}',
					'{chilled delta point sensor temp water}',
					'{chilled delta flow point sensor water}',
					'{chilled cmd isolation point valve water}',
					'{condenser equip leaving pipe water}',
					'{condenser entering equip pipe water}',
					'{cmd condenser isolation point valve water}',
					'{condenser point run state}',
					'{condenser point refrig sensor temp}',
					'{condenser point pressure refrig sensor}',
					'{evaporator point refrig sensor temp}',
					'{evaporator point pressure refrig sensor}',
				]

				expect(defs.protos(parent).toList()).toValEqual(
					makeDicts(children)
				)
			})

			it('returns an empty array for an empty dict', function (): void {
				expect(defs.protos(HDict.make({}))).toEqual([])
			})
		}) // #protos()
	}) // protos

	describe('#toGrid()', function (): void {
		it('returns a grid for the defs', function (): void {
			expect(defs.toGrid()).toBe(grid)
		})
	}) // #toGrid()

	describe('#timezones()', function (): void {
		beforeEach(function (): void {
			grid = new TrioReader(readFile('./defs.trio')).readGrid()
			defs = new HNamespace(grid)
		})

		it('returns a list of timezones', function (): void {
			const tz = defs.timezones[0]

			expect(tz?.value).toBe('Abidjan')
		})
	}) // #timezones()

	describe('#hasRelationship()', function (): void {
		beforeEach(function (): void {
			grid = new TrioReader(readFile('./defs.trio')).readGrid()
			defs = new HNamespace(grid)
		})

		it('returns true when a record has a `hotWaterRef`', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
				})
			).toBe(true)
		})

		it('returns true when a record has a `hotWaterRef` and inputs hot water', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
					relTerm: 'hot-water',
				})
			).toBe(true)
		})

		it('returns true when a record has a `hotWaterRef` and inputs liquid', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
					relTerm: 'liquid',
				})
			).toBe(true)
		})

		it('returns true when a record has a `hotWaterRef` and inputs water', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
					relTerm: 'water',
				})
			).toBe(true)
		})

		it('returns false when a record has a `hotWaterRef` and inputs air', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
					relTerm: 'air',
				})
			).toBe(false)
		})

		it('returns true when a record has a `hotWaterRef`, inputs hot water and matches the target value', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
					relTerm: 'hot-water',
					ref: HRef.make('ahu'),
				})
			).toBe(true)
		})

		it('returns false when a record has a `hotWaterRef`, inputs hot water and does not match the target value', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
				hotWaterRef: HRef.make('ahu'),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
					relTerm: 'hot-water',
					ref: HRef.make('vav'),
				})
			).toBe(false)
		})

		it('returns false when a record does not have any inputs', function (): void {
			const subject = HDict.make({
				ahu: HMarker.make(),
			})

			expect(
				defs.hasRelationship({
					subject,
					relName: 'inputs',
				})
			).toBe(false)
		})

		describe('transitive relationships', function (): void {
			let ahu: HDict
			let fan: HDict
			let status: HDict
			let map: Map<string, HDict>

			const resolve = (ref: HRef): HDict | undefined => map.get(ref.value)

			beforeEach(function (): void {
				map = new Map<string, HDict>()

				ahu = HDict.make({
					id: HRef.make('ahu'),
					ahu: HMarker.make(),
					equip: HMarker.make(),
				})

				map.set('ahu', ahu)

				fan = HDict.make({
					id: HRef.make('fan'),
					discharge: HMarker.make(),
					fan: HMarker.make(),
					equip: HMarker.make(),
					equipRef: HRef.make('ahu'),
				})

				map.set('fan', fan)

				status = HDict.make({
					id: HRef.make('status'),
					speed: HMarker.make(),
					cmd: HMarker.make(),
					point: HMarker.make(),
					equipRef: HRef.make('fan'),
				})

				map.set('status', status)
			})

			it('returns true for a fan that directly references an ahu', function (): void {
				expect(
					defs.hasRelationship({
						subject: fan,
						relName: 'containedBy',
						ref: HRef.make('ahu'),
						resolve,
					})
				).toBe(true)
			})

			it('returns true for a point that directly references a fan', function (): void {
				expect(
					defs.hasRelationship({
						subject: status,
						relName: 'containedBy',
						ref: HRef.make('fan'),
						resolve,
					})
				).toBe(true)
			})

			it('returns true for a point that indirectly references an ahu', function (): void {
				expect(
					defs.hasRelationship({
						subject: status,
						relName: 'containedBy',
						ref: HRef.make('ahu'),
						resolve,
					})
				).toBe(true)
			})

			it('returns false for a fan that does not reference a point', function (): void {
				expect(
					defs.hasRelationship({
						subject: fan,
						relName: 'containedBy',
						ref: HRef.make('status'),
						resolve,
					})
				).toBe(false)
			})

			it('returns false for a point that references itself', function (): void {
				expect(
					defs.hasRelationship({
						subject: status,
						relName: 'containedBy',
						ref: HRef.make('status'),
						resolve,
					})
				).toBe(false)
			})
		}) // transitive relationships

		describe('reciprocal relationships', function (): void {
			let hwp: HDict
			let ahu: HDict
			let map: Map<string, HDict>

			const resolve = (ref: HRef): HDict | undefined => map.get(ref.value)

			beforeEach(function (): void {
				map = new Map<string, HDict>()

				// hot water plant entity
				// id: @hwp, hot, water, plant, equip
				hwp = HDict.make({
					id: HRef.make('hwp'),
					hot: HMarker.make(),
					water: HMarker.make(),
					plant: HMarker.make(),
					equip: HMarker.make(),
				})

				map.set('hwp', ahu)

				// AHU entity which inputs hot water from the plant above
				// id: @ahu, ahu, equip, hotWaterHeating, hotWaterRef: @hwp
				ahu = HDict.make({
					id: HRef.make('ahu'),
					ahu: HMarker.make(),
					equip: HMarker.make(),
					hotWaterHeating: HMarker.make(),
					hotWaterRef: HRef.make('hwp'),
				})

				map.set('fan', ahu)
			})

			it('return true when AHU inputs hot water from HWP', function (): void {
				expect(
					defs.hasRelationship({
						subject: ahu,
						relName: 'inputs',
						relTerm: 'hot-water',
						ref: HRef.make('hwp'),
						resolve,
					})
				).toBe(true)
			})

			it('return true when AHU outputs hot water', function (): void {
				expect(
					defs.hasRelationship({
						subject: ahu,
						relName: 'outputs',
						relTerm: 'hot-water',
						ref: HRef.make('ahu'),
						resolve,
					})
				).toBe(true)
			})

			it('returns false when HWP outputs hot water', function (): void {
				expect(
					defs.hasRelationship({
						subject: hwp,
						relName: 'outputs',
						relTerm: 'hot-water',
						ref: HRef.make('ahu'),
						resolve,
					})
				).toBe(false)
			})
		}) // reciprocal relationships
	}) // #hasRelationship()
})
