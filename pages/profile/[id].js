import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'
import Image from 'next/image'
import { client, getPublications, getProfiles } from '../../api'
import ABI from '../../abi.json'

const CONTRACT_ADDRESS = '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d'

export default function Profile() {
  const [profile, setProfile] = useState()
  const [publications, setPublications] = useState([])
  const [account, setAccount] = useState('')
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (id) {
      fetchProfile()
    }
  }, [id])

  async function fetchProfile() {
    try {
      const returnedProfile = await client.query(getProfiles, { id }).toPromise();
      const profileData = returnedProfile.data.profiles.items[0]
      setProfile(profileData)

      const pubs = await client.query(getPublications, { id, limit: 50 }).toPromise()

      setPublications(pubs.data.publications.items)
    } catch (err) {
      console.log('error fetching profile...', err)
    }
  }

  async function connectWallet() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    })
    console.log('accounts: ', accounts)
    accounts[0]
    setAccount(account)
  }

  function getSigner() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    return provider.getSigner();
  }

  async function followUser() {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      getSigner()
    )

    try {
      const tx = await contract.follow([id], [0x0])
      await tx.wait()
      console.log(`successfully followed ... ${profile.handle}`)
    } catch (err) {
      console.log('error: ', err)
    }
  }

  if (!profile) return null

  return (
    <div>
      <div style={profileContainerStyle}>
        <button onClick={connectWallet}>Sign In</button>
        <Image
          width="200px"
          height="200px"
          src={profile.picture?.original?.url}
        />
        <p>{profile.handle}</p>
        {
            publications.map((pub, index) => (
              <div key={index}>
                <p>{pub.metadata.content}</p>
              </div>
            ))
        }
        <button onClick={followUser}>Follow User</button>
      </div>
    </div>
  )
}

const profileContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
}