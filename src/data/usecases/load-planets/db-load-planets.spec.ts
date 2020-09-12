import { LoadPlanetsRepository } from '@/data/protocols/db/planet/load-planets-repository'
import { PlanetModel } from '@/domain/models/planet'
import { DbLoadPlanets } from './db-load-planets'
import { PlanetAdapter } from '../../../infra/planet/planet-adapter'

const makeFakePlanets = (): PlanetModel[] => {
  return [
    {
      name: 'any_name',
      mass: 27.5
    },
    {
      name: 'other_name',
      mass: 22.2
    },
    {
      name: 'other_name',
      mass: 30.2
    }
  ]
}

interface SutTypes {
  sut: DbLoadPlanets
  loadPlanetsRepositoryStub: LoadPlanetsRepository
}

const makeLoadPlanetsRepository = (): LoadPlanetsRepository => {
  class LoadPlanetsRepositoryStub implements LoadPlanetsRepository {
    async loadAll (pages: number): Promise<PlanetModel[]> {
      return new Promise((resolve) => resolve(makeFakePlanets()))
    }
  }
  return new LoadPlanetsRepositoryStub()
}

const makeSut = (): SutTypes => {
  const loadPlanetsRepositoryStub = makeLoadPlanetsRepository()
  const planetAdapter = new PlanetAdapter()
  const sut = new DbLoadPlanets(loadPlanetsRepositoryStub, planetAdapter)
  return {
    sut,
    loadPlanetsRepositoryStub
  }
}

describe('DbLoadPlanets', () => {
  test('Should call LoadPlanetsRepository', async () => {
    const { sut, loadPlanetsRepositoryStub } = makeSut()
    const loadAllSpy = jest.spyOn(loadPlanetsRepositoryStub, 'loadAll')
    await sut.load(1)
    expect(loadAllSpy).toHaveBeenCalled()
  })

  test('Should return a list of Planets on success', async () => {
    const { sut } = makeSut()
    const planets = await sut.load(1)
    expect(planets.length).toBe(2)
  })

  test('Should throws if LoadPlanetsRepository throws', async () => {
    const { sut, loadPlanetsRepositoryStub } = makeSut()
    jest
      .spyOn(loadPlanetsRepositoryStub, 'loadAll')
      .mockReturnValueOnce(
        new Promise((resolve, reject) => reject(new Error()))
      )
    const promise = sut.load(1)
    await expect(promise).rejects.toThrow()
  })
})
